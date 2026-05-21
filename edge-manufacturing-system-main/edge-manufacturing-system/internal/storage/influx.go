package storage

import (
	"context"
	"fmt"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"github.com/yourorg/cnc-edge/internal/models"
	"go.uber.org/zap"
)

// InfluxStore mengelola penulisan data mesin ke InfluxDB
type InfluxStore struct {
	client   influxdb2.Client
	writeAPI api.WriteAPIBlocking
	queryAPI api.QueryAPI
	cfg      config.InfluxDBConfig
}

// NewInflux membuat koneksi ke InfluxDB dan mengembalikan InfluxStore
func NewInflux(cfg config.InfluxDBConfig) (*InfluxStore, error) {
	client := influxdb2.NewClientWithOptions(
		cfg.URL,
		cfg.Token,
		influxdb2.DefaultOptions().
			SetBatchSize(uint(cfg.BatchSize)).
			SetFlushInterval(uint(cfg.FlushInterval)*1000),
	)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ok, err := client.Ping(ctx)
	if err != nil || !ok {
		return nil, fmt.Errorf("InfluxDB tidak bisa diping di %s: %w", cfg.URL, err)
	}

	writeAPI := client.WriteAPIBlocking(cfg.Org, cfg.Bucket)
	queryAPI := client.QueryAPI(cfg.Org)

	logger.Info("InfluxDB terhubung",
		zap.String("url", cfg.URL),
		zap.String("org", cfg.Org),
		zap.String("bucket", cfg.Bucket),
	)

	return &InfluxStore{
		client:   client,
		writeAPI: writeAPI,
		queryAPI: queryAPI,
		cfg:      cfg,
	}, nil
}

// WriteStatus menyimpan status mesin ke measurement "machine_status"
func (s *InfluxStore) WriteStatus(ctx context.Context, st *models.MachineStatus) error {
	p := influxdb2.NewPoint(
		"machine_status",
		map[string]string{
			"machine_id":   st.MachineID,
			"machine_name": st.MachineName,
		},
		map[string]interface{}{
			"run_status":   st.RunStatus,
			"auto_mode":    st.AutoMode,
			"emergency":    st.Emergency,
			"alarm":        st.Alarm,
			"warning":      st.Warning,
			"motion":       st.Motion,
			"is_running":   boolToInt(st.IsRunning),
			"is_alarm":     boolToInt(st.IsAlarm),
			"is_emergency": boolToInt(st.IsEmergency),
			"program_name": st.ProgramName,
			"battery":      st.Battery,
		},
		st.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteAxis menyimpan posisi axis ke measurement "axis_position"
func (s *InfluxStore) WriteAxis(ctx context.Context, ax *models.AxisData) error {
	p := influxdb2.NewPoint(
		"axis_position",
		map[string]string{
			"machine_id": ax.MachineID,
		},
		map[string]interface{}{
			"abs_x":             ax.AbsX,
			"abs_y":             ax.AbsY,
			"abs_z":             ax.AbsZ,
			"rel_x":             ax.RelX,
			"rel_y":             ax.RelY,
			"rel_z":             ax.RelZ,
			"feedrate":          ax.Feedrate,
			"feedrate_override": ax.FeedrateOverride,
		},
		ax.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteSpindle menyimpan data spindle ke measurement "spindle"
func (s *InfluxStore) WriteSpindle(ctx context.Context, sp *models.SpindleData) error {
	p := influxdb2.NewPoint(
		"spindle",
		map[string]string{
			"machine_id": sp.MachineID,
		},
		map[string]interface{}{
			"speed_actual":  sp.SpeedActual,
			"speed_command": sp.SpeedCommand,
			"load_percent":  sp.LoadPercent,
			"override":      sp.Override,
		},
		sp.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteTool menyimpan data tool ke measurement "tool_data"
func (s *InfluxStore) WriteTool(ctx context.Context, td *models.ToolData) error {
	p := influxdb2.NewPoint(
		"tool_data",
		map[string]string{
			"machine_id": td.MachineID,
		},
		map[string]interface{}{
			"tool_actual":    td.ToolActual,
			"tool_next":      td.ToolNext,
			"length_offset":  td.LengthOffset,
			"radius_offset":  td.RadiusOffset,
			"length_wear":    td.LengthWear,
			"radius_wear":    td.RadiusWear,
		},
		td.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteTimer menyimpan data timer ke measurement "machine_timer"
func (s *InfluxStore) WriteTimer(ctx context.Context, td *models.TimerData) error {
	operatingTotalSec := float64(td.OperatingTimeMin)*60 + float64(td.OperatingTimeMsec)/1000
	cuttingTotalSec := float64(td.CuttingTimeMin)*60 + float64(td.CuttingTimeMsec)/1000
	cycleTotalSec := float64(td.CycleTimeMin)*60 + float64(td.CycleTimeMsec)/1000

	p := influxdb2.NewPoint(
		"machine_timer",
		map[string]string{
			"machine_id": td.MachineID,
		},
		map[string]interface{}{
			"operating_time_sec": operatingTotalSec,
			"cutting_time_sec":   cuttingTotalSec,
			"cycle_time_sec":     cycleTotalSec,
			"operating_time_min": td.OperatingTimeMin,
			"cutting_time_min":   td.CuttingTimeMin,
			"cycle_time_min":     td.CycleTimeMin,
		},
		td.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteAlarm menyimpan alarm event ke measurement "alarm_events"
func (s *InfluxStore) WriteAlarm(ctx context.Context, al *models.AlarmEvent) error {
	p := influxdb2.NewPoint(
		"alarm_events",
		map[string]string{
			"machine_id":   al.MachineID,
			"machine_name": al.MachineName,
			"severity":     al.Severity,
			"type":         al.Type,
		},
		map[string]interface{}{
			"code":    al.Code,
			"message": al.Message,
			"axis":    al.Axis,
		},
		al.Timestamp,
	)
	return s.write(ctx, p)
}

// WriteOEE menyimpan hasil kalkulasi OEE ke measurement "oee_metrics"
func (s *InfluxStore) WriteOEE(ctx context.Context, oee *models.OEEMetrics) error {
	p := influxdb2.NewPoint(
		"oee_metrics",
		map[string]string{
			"machine_id":   oee.MachineID,
			"machine_name": oee.MachineName,
			"period":       oee.Period,
		},
		map[string]interface{}{
			"availability":       oee.Availability,
			"performance":        oee.Performance,
			"quality":            oee.Quality,
			"oee":                oee.OEE,
			"planned_time_min":   oee.PlannedTime,
			"operating_time_min": oee.OperatingTime,
			"cutting_time_min":   oee.CuttingTime,
			"alarm_count":        oee.AlarmCount,
		},
		oee.CalculatedAt,
	)
	return s.write(ctx, p)
}

// WriteSimulatorData menyimpan data dari simulator Python
func (s *InfluxStore) WriteSimulatorData(ctx context.Context, machineID string, data *models.SimulatorPayload) error {
	now := time.Now()

	// Axis data
	if abs, ok := data.Achsen["ABS"]; ok {
		axisPoint := influxdb2.NewPoint(
			"axis_position",
			map[string]string{"machine_id": machineID},
			map[string]interface{}{
				"abs_x": abs["X"],
				"abs_y": abs["Y"],
				"abs_z": abs["Z"],
			},
			now,
		)
		if err := s.write(ctx, axisPoint); err != nil {
			return err
		}
	}

	// Laenge / progress
	laengePoint := influxdb2.NewPoint(
		"production_progress",
		map[string]string{"machine_id": machineID},
		map[string]interface{}{
			"laenge_ist":     data.LaengeIst,
			"laenge_soll":    data.LaengeSoll,
			"laenge_prozent": data.LaengeProzent,
			"leitwert":       data.Leitwert,
		},
		now,
	)
	return s.write(ctx, laengePoint)
}

// QueryLatestStatus mengambil status terbaru sebuah mesin dari InfluxDB
func (s *InfluxStore) QueryLatestStatus(ctx context.Context, machineID string) (map[string]interface{}, error) {
	query := fmt.Sprintf(`
		from(bucket: "%s")
		  |> range(start: -1h)
		  |> filter(fn: (r) => r._measurement == "machine_status")
		  |> filter(fn: (r) => r.machine_id == "%s")
		  |> last()
	`, s.cfg.Bucket, machineID)

	result, err := s.queryAPI.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query InfluxDB gagal: %w", err)
	}
	defer result.Close()

	data := make(map[string]interface{})
	for result.Next() {
		record := result.Record()
		data[record.Field()] = record.Value()
	}
	return data, result.Err()
}

// Close menutup koneksi InfluxDB
func (s *InfluxStore) Close() {
	s.client.Close()
	logger.Info("InfluxDB connection closed")
}

func (s *InfluxStore) write(ctx context.Context, p *write.Point) error {
	if err := s.writeAPI.WritePoint(ctx, p); err != nil {
		logger.Error("Gagal tulis ke InfluxDB",
			zap.String("measurement", p.Name()),
			zap.Error(err),
		)
		return err
	}
	return nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
