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

	// TODO: parse poll interval from production_config or use default 5s
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	pollCount := 0
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			pollCount++

			// 1. Read Status
			if status, err := connector.ReadStatus(ctx); err == nil && status != nil {
				status.MachineID = cfg.ID
				m.publishToEMQX(broker.TopicStatus("cnc", cfg.MachineType, cfg.ID), status)
			} else if err != nil {
				logger.Warn("Failed to read status", zap.String("machine", cfg.ID), zap.Error(err))
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
				OperatingTimeMin:  float64(pollCount) / 12.0,        // ~1 min per 12 polls (5s interval)
				OperatingTimeMsec: float64(pollCount%12) * 5000.0,
				CuttingTimeMin:    float64(pollCount*4) / float64(12*5), // ~80% of operating
				CuttingTimeMsec:   float64((pollCount*4)%(12*5)) * 1000.0,
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


