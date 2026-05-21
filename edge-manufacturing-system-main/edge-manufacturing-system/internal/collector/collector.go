package collector

import (
	"context"
	"encoding/json"
	"strings"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/broker"
	"github.com/yourorg/cnc-edge/internal/logger"
	mangosync "github.com/yourorg/cnc-edge/internal/mango"
	"github.com/yourorg/cnc-edge/internal/models"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
)

// Collector mengelola semua MQTT subscription dan routing data ke storage
type Collector struct {
	mqtt     *broker.Client
	influx   *storage.InfluxStore
	postgres *storage.PostgresStore
	mango    *mangosync.SyncService
	cfg      *config.Config

	machineNamesMu sync.RWMutex
	machineNames   map[string]string // from machine_configs (PostgreSQL)
}

// New membuat Collector baru
func New(
	mqttClient *broker.Client,
	influx *storage.InfluxStore,
	pg *storage.PostgresStore,
	mango *mangosync.SyncService,
	cfg *config.Config,
) *Collector {
	return &Collector{
		mqtt:         mqttClient,
		influx:       influx,
		postgres:     pg,
		mango:        mango,
		cfg:          cfg,
		machineNames: make(map[string]string),
	}
}

// Start mendaftarkan semua subscription MQTT
func (c *Collector) Start() error {
	t := c.cfg.Topics

	// Subscribe simulator Python (fanuc/cnc/data)
	if err := c.mqtt.Subscribe(t.Simulator, c.cfg.MQTT.QoSAxis, c.handleSimulator); err != nil {
		return err
	}

	// Subscribe semua mesin dengan wildcard
	// cnc/+/+/status, cnc/+/+/axis, dll.
	topics := map[string]struct {
		qos     byte
		handler mqtt.MessageHandler
	}{
		t.Base + "/+/+/" + t.StatusSuffix:  {c.cfg.MQTT.QoSStatus, c.handleStatus},
		t.Base + "/+/+/" + t.AxisSuffix:    {c.cfg.MQTT.QoSAxis, c.handleAxis},
		t.Base + "/+/+/" + t.AlarmSuffix:   {c.cfg.MQTT.QoSAlarm, c.handleAlarm},
		t.Base + "/+/+/" + t.ToolSuffix:    {c.cfg.MQTT.QoSTool, c.handleTool},
		t.Base + "/+/+/" + t.TimerSuffix:   {c.cfg.MQTT.QoSStatus, c.handleTimer},
		t.Base + "/+/+/" + t.SpindleSuffix: {c.cfg.MQTT.QoSAxis, c.handleSpindle},
		t.Base + "/+/+/production":         {c.cfg.MQTT.QoSStatus, c.handleProduction},
	}

	for topic, sub := range topics {
		if err := c.mqtt.Subscribe(topic, sub.qos, sub.handler); err != nil {
			return err
		}
	}

	_ = c.RefreshMachineCacheFromPostgres()

	logger.Info("Collector: semua subscription MQTT aktif")
	return nil
}

// RefreshMachineCacheFromPostgres reloads display names from admin machine_configs (no MQTT restart).
func (c *Collector) RefreshMachineCacheFromPostgres() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	rows, err := c.postgres.ListMachineConfigs(ctx)
	if err != nil {
		return err
	}
	c.machineNamesMu.Lock()
	for _, r := range rows {
		if r.Enabled {
			c.machineNames[r.ID] = r.Name
		}
	}
	c.machineNamesMu.Unlock()
	return nil
}

// ─── Handler: Simulator Python ────────────────────────────────────────────────

func (c *Collector) handleSimulator(client mqtt.Client, msg mqtt.Message) {
	var payload models.SimulatorPayload
	if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
		logger.Error("Parse simulator payload gagal", zap.Error(err))
		return
	}

	ctx := context.Background()
	machineID := "simulator_dmg"

	if err := c.influx.WriteSimulatorData(ctx, machineID, &payload); err != nil {
		logger.Error("Write simulator ke InfluxDB gagal", zap.Error(err))
	}

	logger.Debug("Simulator data diterima",
		zap.String("machine", machineID),
		zap.Float64("leitwert", payload.Leitwert),
		zap.Float64("progress", payload.LaengeProzent),
	)
}

// ─── Handler: Machine Status ──────────────────────────────────────────────────

func (c *Collector) handleStatus(client mqtt.Client, msg mqtt.Message) {
	machineID, machineType := parseTopic(msg.Topic())

	var status models.MachineStatus
	if err := json.Unmarshal(msg.Payload(), &status); err != nil {
		logger.Error("Parse status payload gagal",
			zap.String("topic", msg.Topic()), zap.Error(err))
		return
	}

	status.MachineID = machineID
	status.Timestamp = time.Now()
	status.IsRunning = status.RunStatus == 2   // STaRT
	status.IsAlarm = status.Alarm == 1
	status.IsEmergency = status.Emergency == 1

	ctx := context.Background()

	if err := c.influx.WriteStatus(ctx, &status); err != nil {
		logger.Error("Write status ke InfluxDB gagal", zap.Error(err))
	}

	machineName := c.getMachineName(machineID, machineType)

	// Trigger alarm handler jika ada kondisi emergency
	if status.IsEmergency {
		alarm := &models.AlarmEvent{
			MachineID:   machineID,
			MachineName: machineName,
			Timestamp:   time.Now(),
			Code:        9999,
			Message:     "EMERGENCY STOP aktif",
			Severity:    "emergency",
			Type:        "system",
		}
		c.processAlarm(ctx, alarm)
	}

	logger.Debug("Status mesin diterima",
		zap.String("machine", machineID),
		zap.Int("run_status", status.RunStatus),
		zap.Bool("is_alarm", status.IsAlarm),
	)
}

// ─── Handler: Axis Data ───────────────────────────────────────────────────────

func (c *Collector) handleAxis(client mqtt.Client, msg mqtt.Message) {
	machineID, _ := parseTopic(msg.Topic())

	var axis models.AxisData
	if err := json.Unmarshal(msg.Payload(), &axis); err != nil {
		logger.Error("Parse axis payload gagal", zap.Error(err))
		return
	}

	axis.MachineID = machineID
	axis.Timestamp = time.Now()

	ctx := context.Background()

	if err := c.influx.WriteAxis(ctx, &axis); err != nil {
		logger.Error("Write axis ke InfluxDB gagal", zap.Error(err))
	}
}

// ─── Handler: Alarm ───────────────────────────────────────────────────────────

func (c *Collector) handleAlarm(client mqtt.Client, msg mqtt.Message) {
	machineID, machineType := parseTopic(msg.Topic())

	var alarm models.AlarmEvent
	if err := json.Unmarshal(msg.Payload(), &alarm); err != nil {
		logger.Error("Parse alarm payload gagal", zap.Error(err))
		return
	}

	alarm.MachineID = machineID
	alarm.MachineName = c.getMachineName(machineID, machineType)
	alarm.Timestamp = time.Now()

	c.processAlarm(context.Background(), &alarm)
}

func (c *Collector) processAlarm(ctx context.Context, alarm *models.AlarmEvent) {
	// Simpan ke InfluxDB untuk time-series chart
	if err := c.influx.WriteAlarm(ctx, alarm); err != nil {
		logger.Error("Write alarm ke InfluxDB gagal", zap.Error(err))
	}

	// Simpan ke PostgreSQL untuk audit trail permanen
	id, err := c.postgres.InsertAlarm(ctx, alarm)
	if err != nil {
		logger.Error("Insert alarm ke PostgreSQL gagal", zap.Error(err))
	} else {
		alarm.ID = id
	}

	if c.mango != nil {
		if err := c.mango.EnqueueAlarmEvent(ctx, alarm); err != nil {
			logger.Warn("Enqueue alarm ke MANGO gagal", zap.Error(err))
		}
	}

	logger.Warn("ALARM mesin",
		zap.String("machine", alarm.MachineID),
		zap.String("severity", alarm.Severity),
		zap.String("message", alarm.Message),
		zap.Int("code", alarm.Code),
	)
}

// ─── Handler: Production Data ─────────────────────────────────────────────────

func (c *Collector) handleProduction(client mqtt.Client, msg mqtt.Message) {
	var record models.ProductionLog
	if err := json.Unmarshal(msg.Payload(), &record); err != nil {
		logger.Error("Parse production payload gagal", zap.Error(err))
		return
	}
	record.Timestamp = time.Now()

	// Hitung Shift berdasarkan jam (WIB / Local)
	hour := record.Timestamp.Hour()
	if hour >= 7 && hour < 15 {
		record.Shift = 1
	} else if hour >= 15 && hour < 23 {
		record.Shift = 2
	} else {
		record.Shift = 3
	}

	ctx := context.Background()

	// Simpan ke database Edge lokal untuk ditampilkan di Dashboard Edge
	if _, err := c.postgres.InsertProductionLog(ctx, &record); err != nil {
		logger.Error("Simpan production log ke Edge DB gagal", zap.Error(err))
	}

	if c.mango != nil {
		if err := c.mango.EnqueueProductionRecord(ctx, &record); err != nil {
			logger.Warn("Enqueue production log ke MANGO gagal", zap.Error(err))
		} else {
			logger.Debug("Production log disinkronkan ke MANGO", zap.String("machine", record.MachineID), zap.Float64("oee", record.OEE))
		}
	}
}

// ─── Handler: Tool Data ───────────────────────────────────────────────────────

func (c *Collector) handleTool(client mqtt.Client, msg mqtt.Message) {
	machineID, _ := parseTopic(msg.Topic())

	var tool models.ToolData
	if err := json.Unmarshal(msg.Payload(), &tool); err != nil {
		logger.Error("Parse tool payload gagal", zap.Error(err))
		return
	}

	tool.MachineID = machineID
	tool.Timestamp = time.Now()

	ctx := context.Background()
	if err := c.influx.WriteTool(ctx, &tool); err != nil {
		logger.Error("Write tool ke InfluxDB gagal", zap.Error(err))
	}
}

// ─── Handler: Timer Data ──────────────────────────────────────────────────────

func (c *Collector) handleTimer(client mqtt.Client, msg mqtt.Message) {
	machineID, _ := parseTopic(msg.Topic())

	var timer models.TimerData
	if err := json.Unmarshal(msg.Payload(), &timer); err != nil {
		logger.Error("Parse timer payload gagal", zap.Error(err))
		return
	}

	timer.MachineID = machineID
	timer.Timestamp = time.Now()

	ctx := context.Background()
	if err := c.influx.WriteTimer(ctx, &timer); err != nil {
		logger.Error("Write timer ke InfluxDB gagal", zap.Error(err))
	}
}

// ─── Handler: Spindle Data ────────────────────────────────────────────────────

func (c *Collector) handleSpindle(client mqtt.Client, msg mqtt.Message) {
	machineID, _ := parseTopic(msg.Topic())

	var spindle models.SpindleData
	if err := json.Unmarshal(msg.Payload(), &spindle); err != nil {
		logger.Error("Parse spindle payload gagal", zap.Error(err))
		return
	}

	spindle.MachineID = machineID
	spindle.Timestamp = time.Now()

	ctx := context.Background()
	if err := c.influx.WriteSpindle(ctx, &spindle); err != nil {
		logger.Error("Write spindle ke InfluxDB gagal", zap.Error(err))
	}
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// parseTopic mengekstrak machineID dan siteID dari topic
// Format: edge/{site_id}/{machine_id}/suffix
func parseTopic(topic string) (machineID, siteID string) {
	parts := strings.Split(topic, "/")
	if len(parts) >= 3 {
		siteID = parts[1]
		machineID = parts[2]
	}
	return
}

func (c *Collector) getMachineName(machineID, siteID string) string {
	c.machineNamesMu.RLock()
	if n, ok := c.machineNames[machineID]; ok && n != "" {
		c.machineNamesMu.RUnlock()
		return n
	}
	c.machineNamesMu.RUnlock()
	for _, m := range c.cfg.Machines {
		if m.ID == machineID {
			return m.Name
		}
	}
	return siteID + "_" + machineID
}
