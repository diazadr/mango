package oee

import (
	"context"
	"time"

	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"github.com/yourorg/cnc-edge/internal/models"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
)

// MangoSyncer abstracts the MANGO sync service to avoid import cycles.
type MangoSyncer interface {
	EnqueueProductionRecord(ctx context.Context, record *models.ProductionLog) error
}

// Calculator menghitung OEE secara periodik
type Calculator struct {
	influx   *storage.InfluxStore
	postgres *storage.PostgresStore
	cfg      *config.Config
	mango    MangoSyncer
	ticker   *time.Ticker
	done     chan struct{}
}

// New membuat OEE Calculator baru
func New(
	influx *storage.InfluxStore,
	pg *storage.PostgresStore,
	cfg *config.Config,
) *Calculator {
	return &Calculator{
		influx:   influx,
		postgres: pg,
		cfg:      cfg,
		done:     make(chan struct{}),
	}
}

// SetMangoSync injects the MANGO sync service after construction
// (avoids circular dependency — main.go wires this up).
func (c *Calculator) SetMangoSync(m MangoSyncer) {
	c.mango = m
}

// Start menjalankan kalkulasi OEE secara periodik
func (c *Calculator) Start() {
	interval := time.Duration(c.cfg.OEE.CalcInterval) * time.Second
	c.ticker = time.NewTicker(interval)

	logger.Info("OEE Calculator dimulai",
		zap.Duration("interval", interval),
	)

	go func() {
		for {
			select {
			case <-c.ticker.C:
				c.calculateAll()
			case <-c.done:
				return
			}
		}
	}()
}

// Stop menghentikan kalkulasi
func (c *Calculator) Stop() {
	if c.ticker != nil {
		c.ticker.Stop()
	}
	close(c.done)
}

// calculateAll menghitung OEE untuk semua mesin yang aktif.
func (c *Calculator) calculateAll() {
	ctx := context.Background()
	machines, err := c.postgres.ListMachineConfigs(ctx)
	if err != nil {
		logger.Error("OEE Calculator: Gagal mengambil daftar mesin", zap.Error(err))
		return
	}

	shift := c.currentShift()
	now := time.Now()

	for _, m := range machines {
		if !m.Enabled {
			continue
		}

		summary, err := c.postgres.GetProductionSummary(ctx, m.ID, now, shift)
		if err != nil {
			continue
		}

		qtyOk, _ := summary["qty_ok"].(int)
		qtyNg, _ := summary["qty_ng"].(int)
		operating, _ := summary["operating_time_min"].(float64)
		downtime, _ := summary["downtime_min"].(float64)

		avail := 85.0
		perf := 90.0
		qual := 99.0
		oeeVal := 75.0

		// Jika ada data produksi asli
		if operating > 0 {
			planned := operating + downtime
			if planned > 0 {
				avail = clamp((operating/planned)*100, 0, 100)
			}
			qual = 100.0
			if (qtyOk + qtyNg) > 0 {
				qual = clamp(float64(qtyOk)/float64(qtyOk+qtyNg)*100, 0, 100)
			}
			avgCycle, _ := summary["avg_cycle_time"].(float64)
			if avgCycle > 0 && operating > 0 {
				idealOp := float64(qtyOk+qtyNg) * avgCycle
				perf = clamp((idealOp/operating)*100, 0, 100)
			}
			oeeVal = clamp((avail/100)*(perf/100)*(qual/100)*100, 0, 100)
		} else {
			// Jika mesin dalam status nyala (Enabled) tapi belum beroperasi (operating == 0),
			// kirim metrik 0 sesuai standar (bukan nilai dummy).
			avail = 0.0
			perf = 0.0
			qual = 0.0
			oeeVal = 0.0
			qtyOk = 0
			operating = 0.0
		}

		if c.mango != nil {
			record := &models.ProductionLog{
				MachineID:        m.ID,
				MachineName:      m.Name,
				Shift:            shift,
				QtyOK:            qtyOk,
				QtyNG:            qtyNg,
				OperatingTimeMin: operating,
				DowntimeMin:      downtime,
				OEE:              oeeVal,
				Availability:     avail,
				Performance:      perf,
				Quality:          qual,
				Timestamp:        now,
			}
			if err := c.mango.EnqueueProductionRecord(ctx, record); err != nil {
				logger.Warn("OEE Calculator: Gagal mengirim OEE ke MANGO", zap.Error(err))
			} else {
				logger.Debug("OEE Calculator: Berhasil mengirim OEE ke MANGO", zap.String("machine", m.ID), zap.Float64("oee", oeeVal))
			}
		}
	}
}


// calculate menghitung OEE untuk satu mesin berdasarkan state saat ini
//
// Rumus OEE:
//
//	Availability = Operating Time / Planned Time
//	Performance  = Cutting Time / Operating Time
//	Quality      = Good Parts / Total Parts (asumsikan 100% jika tidak ada scrap data)
//	OEE          = Availability × Performance × Quality
func (c *Calculator) calculate(ctx context.Context, state *models.MachineState) *models.OEEMetrics {
	shiftMinutes := float64(c.cfg.OEE.ShiftHours * 60)
	operatingMin := float64(state.Timer.OperatingTimeMin) +
		float64(state.Timer.OperatingTimeMsec)/60000
	cuttingMin := float64(state.Timer.CuttingTimeMin) +
		float64(state.Timer.CuttingTimeMsec)/60000

	if shiftMinutes <= 0 || operatingMin <= 0 {
		return nil
	}

	// Hitung alarm count sejak awal shift
	shiftStart := time.Now().Truncate(time.Duration(c.cfg.OEE.ShiftHours) * time.Hour)
	alarmCount, _ := c.postgres.CountAlarmsSince(ctx, state.MachineID, shiftStart)

	// Cek apakah ada checkin aktif untuk mendapatkan Ideal Cycle Time
	checkin, _ := c.postgres.GetCurrentCheckin(ctx, state.MachineID)
	
	availability := clamp(operatingMin/shiftMinutes*100, 0, 100)
	
	// Phase 5: OEE Performance sesuai standar ISA-95 jika data IdealCycleTime tersedia
	performance := clamp(cuttingMin/operatingMin*100, 0, 100) // Fallback Default
	quality := 100.0
	
	if checkin != nil {
		if checkin.IdealCycleTimeSec > 0 {
			totalQty := checkin.ActualQtyOK + checkin.ActualQtyNG
			idealMin := checkin.IdealCycleTimeSec / 60.0
			perfVal := (idealMin * float64(totalQty)) / operatingMin * 100
			performance = clamp(perfVal, 0, 100)
		}
		
		if (checkin.ActualQtyOK + checkin.ActualQtyNG) > 0 {
			quality = float64(checkin.ActualQtyOK) / float64(checkin.ActualQtyOK + checkin.ActualQtyNG) * 100
		}
	}

	oeeValue := (availability / 100) * (performance / 100) * (quality / 100) * 100

	return &models.OEEMetrics{
		MachineID:     state.MachineID,
		MachineName:   state.MachineName,
		Period:        "shift",
		CalculatedAt:  time.Now(),
		Availability:  round2(availability),
		Performance:   round2(performance),
		Quality:       round2(quality),
		OEE:           round2(oeeValue),
		PlannedTime:   shiftMinutes,
		OperatingTime: round2(operatingMin),
		CuttingTime:   round2(cuttingMin),
		AlarmCount:    alarmCount,
	}
}

// currentShift returns the current shift number based on time of day.
func (c *Calculator) currentShift() int {
	hour := time.Now().Hour()
	switch {
	case hour >= 6 && hour < 14:
		return 1
	case hour >= 14 && hour < 22:
		return 2
	default:
		return 3
	}
}

func clamp(v, min, max float64) float64 {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}

func round2(f float64) float64 {
	return float64(int(f*100)) / 100
}
