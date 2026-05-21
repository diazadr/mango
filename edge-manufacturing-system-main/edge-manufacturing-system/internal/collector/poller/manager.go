package poller

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/yourorg/cnc-edge/internal/broker"
	"github.com/yourorg/cnc-edge/internal/logger"
	"github.com/yourorg/cnc-edge/internal/models"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
)

// Manager orchestrates the polling of multiple machines
type Manager struct {
	mqtt     *broker.Client
	postgres *storage.PostgresStore
	
	mu       sync.Mutex
	routines map[string]context.CancelFunc // Map of machine ID to cancel function
}

// NewManager creates a new Poller Manager
func NewManager(mqtt *broker.Client, postgres *storage.PostgresStore) *Manager {
	return &Manager{
		mqtt:     mqtt,
		postgres: postgres,
		routines: make(map[string]context.CancelFunc),
	}
}

// Start loads configs from DB and starts polling
func (m *Manager) Start() error {
	logger.Info("PollerManager: Starting...")
	return m.Reload()
}

// Reload stops all active pollers and restarts them based on the latest DB config
func (m *Manager) Reload() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	configs, err := m.postgres.ListMachineConfigs(ctx)
	if err != nil {
		return fmt.Errorf("failed to list machine configs: %w", err)
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	// Stop all existing pollers
	for id, cancelFn := range m.routines {
		logger.Debug("Stopping poller", zap.String("machine_id", id))
		cancelFn()
		delete(m.routines, id)
	}

	// Start new pollers for enabled machines
	for _, cfg := range configs {
		if !cfg.Enabled {
			continue
		}

		logger.Info("Starting poller", zap.String("machine_id", cfg.ID), zap.String("protocol", cfg.Protocol))
		
		pollCtx, cancelPoll := context.WithCancel(context.Background())
		m.routines[cfg.ID] = cancelPoll

		go m.pollMachine(pollCtx, cfg)
	}

	return nil
}

// Stop gracefully stops all pollers
func (m *Manager) Stop() {
	m.mu.Lock()
	defer m.mu.Unlock()

	for id, cancelFn := range m.routines {
		cancelFn()
		delete(m.routines, id)
	}
	logger.Info("PollerManager: Stopped all pollers")
}

func (m *Manager) pollMachine(ctx context.Context, cfg models.MachineConfigRow) {
	connector, err := CreateConnector(cfg.Protocol, cfg.ConnectionConfigJSON)
	if err != nil {
		logger.Error("Failed to create connector", zap.String("machine", cfg.ID), zap.Error(err))
		_ = m.postgres.InsertConnectionLog(context.Background(), &models.ConnectionLog{
			MachineID:   cfg.ID,
			MachineName: cfg.Name,
			Protocol:    cfg.Protocol,
			EventType:   "error",
			IsSimulator: cfg.Protocol == "simulator",
			Message:     "Failed to create connector: " + err.Error(),
			OccurredAt:  time.Now(),
		})
		return
	}

	startConn := time.Now()
	// Connect to machine
	if err := connector.Connect(ctx); err != nil {
		latency := int(time.Since(startConn).Milliseconds())
		logger.Error("Failed to connect to machine", zap.String("machine", cfg.ID), zap.Error(err))
		_ = m.postgres.InsertConnectionLog(context.Background(), &models.ConnectionLog{
			MachineID:   cfg.ID,
			MachineName: cfg.Name,
			Protocol:    cfg.Protocol,
			EventType:   "error",
			IsSimulator: cfg.Protocol == "simulator",
			LatencyMs:   latency,
			Message:     "Connection failed: " + err.Error(),
			OccurredAt:  time.Now(),
		})
		// We could implement retry logic here, but for now we'll just exit the goroutine
		return
	}

	latencyOK := int(time.Since(startConn).Milliseconds())
	_ = m.postgres.InsertConnectionLog(context.Background(), &models.ConnectionLog{
		MachineID:   cfg.ID,
		MachineName: cfg.Name,
		Protocol:    cfg.Protocol,
		EventType:   "connected",
		IsSimulator: cfg.Protocol == "simulator",
		LatencyMs:   latencyOK,
		Message:     "Successfully connected",
		OccurredAt:  time.Now(),
	})

	defer func() {
		connector.Disconnect(context.Background())
		_ = m.postgres.InsertConnectionLog(context.Background(), &models.ConnectionLog{
			MachineID:   cfg.ID,
			MachineName: cfg.Name,
			Protocol:    cfg.Protocol,
			EventType:   "disconnected",
			IsSimulator: cfg.Protocol == "simulator",
			Message:     "Machine disconnected (poller stopped)",
			OccurredAt:  time.Now(),
		})
	}()

	// Parse poll interval from production_config or use default 5s
	intervalSec := 5
	if cfg.ProductionConfigJSON != "" && cfg.ProductionConfigJSON != "{}" {
		var pConfig map[string]interface{}
		if err := json.Unmarshal([]byte(cfg.ProductionConfigJSON), &pConfig); err == nil {
			if v, ok := pConfig["poll_interval_sec"].(float64); ok && v > 0 {
				intervalSec = int(v)
			}
		}
	}

	ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
	defer ticker.Stop()

	pollCount := 0
	pollsPerMin := 60.0 / float64(intervalSec)
	if pollsPerMin <= 0 {
		pollsPerMin = 1.0 // safety fallback
	}

	var stopStartTime time.Time
	var unhandledDowntimeLogged bool

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Cek apakah ada checkin aktif (Work Order sedang jalan)
			checkin, _ := m.postgres.GetCurrentCheckin(context.Background(), cfg.ID)
			hasActiveWO := checkin != nil

			// Hanya tambah waktu operasi/potong jika WO sedang aktif
			if hasActiveWO {
				pollCount++
			}

			// 1. Read Status
			var isStopped bool
			if status, err := connector.ReadStatus(ctx); err == nil && status != nil {
				status.MachineID = cfg.ID
				m.publishToEMQX(broker.TopicStatus("cnc", cfg.MachineType, cfg.ID), status)
				
				if status.RunStatus == 0 || status.Alarm == 1 {
					isStopped = true
				}
			} else if err != nil {
				logger.Warn("Failed to read status", zap.String("machine", cfg.ID), zap.Error(err))
			}

			if isStopped && hasActiveWO {
				if stopStartTime.IsZero() {
					stopStartTime = time.Now()
				} else if time.Since(stopStartTime) > 5*time.Minute && !unhandledDowntimeLogged {
					// Otomatis catat downtime
					dl := &models.DowntimeLog{
						MachineID: cfg.ID,
						Category:  "Uncategorized",
						Reason:    "Auto-detected Stoppage > 5 mins",
						StartedAt: time.Now().Add(-5 * time.Minute),
					}
					dlId, _ := m.postgres.InsertDowntimeLog(context.Background(), dl)
					if dlId > 0 {
						unhandledDowntimeLogged = true
						_ = m.postgres.EnqueueSync(context.Background(), "downtime", "/production/downtime", cfg.ID, []byte(fmt.Sprintf(`{"id":%d}`, dlId)))
					}
				}
			} else {
				stopStartTime = time.Time{}
				unhandledDowntimeLogged = false
			}

			// 2. Read Axis
			if axis, err := connector.ReadAxis(ctx); err == nil && axis != nil {
				axis.MachineID = cfg.ID
				m.publishToEMQX(broker.TopicAxis("cnc", cfg.MachineType, cfg.ID), axis)
			}

			// 3. Read Spindle
			if spindle, err := connector.ReadSpindle(ctx); err == nil && spindle != nil {
				spindle.MachineID = cfg.ID
				// Using TopicSuffix pattern, let's create a helper or just construct it
				topic := fmt.Sprintf("cnc/%s/%s/spindle", cfg.MachineType, cfg.ID)
				m.publishToEMQX(topic, spindle)
			}

			// 4. Read Alarms
			if alarms, err := connector.ReadAlarms(ctx); err == nil && len(alarms) > 0 {
				for _, alarm := range alarms {
					alarm.MachineID = cfg.ID
					alarm.MachineName = cfg.Name
					m.publishToEMQX(broker.TopicAlarm("cnc", cfg.MachineType, cfg.ID), alarm)
				}
			}

			// 5. Generate Timer data (required for OEE calculation)
			// Timer accumulates operating/cutting time based on poll count
			timerData := &models.TimerData{
				MachineID:         cfg.ID,
				Timestamp:         time.Now(),
				OperatingTimeMin:  float64(pollCount) / pollsPerMin,
				OperatingTimeMsec: float64(pollCount%int(pollsPerMin)) * float64(intervalSec*1000),
				CuttingTimeMin:    (float64(pollCount) / pollsPerMin) * 0.8, // ~80% of operating
				CuttingTimeMsec:   0, // simplified for simulator
				CycleTimeMin:      5.0,
				CycleTimeMsec:     0,
			}
			timerTopic := fmt.Sprintf("cnc/%s/%s/timer", cfg.MachineType, cfg.ID)
			m.publishToEMQX(timerTopic, timerData)
		}
	}
}

func (m *Manager) publishToEMQX(topic string, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		logger.Error("Failed to marshal payload for EMQX", zap.String("topic", topic), zap.Error(err))
		return
	}

	// Publish with QoS 1, not retained
	if err := m.mqtt.Publish(topic, 1, false, data); err != nil {
		logger.Error("Failed to publish to EMQX", zap.String("topic", topic), zap.Error(err))
	}
}


