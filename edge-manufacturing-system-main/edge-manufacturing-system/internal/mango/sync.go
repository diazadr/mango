package mango

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	retry "github.com/avast/retry-go/v4"
	"github.com/go-resty/resty/v2"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"github.com/yourorg/cnc-edge/internal/models"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type SyncService struct {
	cfg      config.MangoConfig
	cloudCfg config.CloudMQTTConfig
	postgres *storage.PostgresStore
	client   *resty.Client
	mqttClient mqtt.Client

	mu     sync.RWMutex
	status models.MangoSyncStatus

	cancel context.CancelFunc
	wg     sync.WaitGroup
}

func New(cfg config.MangoConfig, cloudCfg config.CloudMQTTConfig, postgres *storage.PostgresStore) *SyncService {
	baseURL := strings.TrimRight(cfg.BaseURL, "/")
	client := resty.New().
		SetBaseURL(baseURL).
		SetHeader("Content-Type", "application/json").
		SetHeader("X-EDGE-API-KEY", cfg.APIKey).
		SetTimeout(20 * time.Second)

	var mqttClient mqtt.Client
	if cloudCfg.Enabled {
		opts := mqtt.NewClientOptions()
		opts.AddBroker(cloudCfg.Broker)
		opts.SetClientID(cloudCfg.ClientID)
		opts.SetAutoReconnect(true)
		opts.SetConnectRetry(true)
		opts.SetConnectRetryInterval(15 * time.Second)
		opts.SetKeepAlive(30 * time.Second)
		if cloudCfg.Username != "" {
			opts.SetUsername(cloudCfg.Username)
		}
		if cloudCfg.Password != "" {
			opts.SetPassword(cloudCfg.Password)
		}
		if cloudCfg.TLS {
			opts.SetTLSConfig(&tls.Config{
				InsecureSkipVerify: false,
				MinVersion:         tls.VersionTLS12,
			})
		}
		opts.OnConnect = func(_ mqtt.Client) {
			logger.Info("Terhubung ke EMQX Cloud MQTT",
				zap.String("broker", cloudCfg.Broker),
				zap.String("client_id", cloudCfg.ClientID),
			)
		}
		opts.OnConnectionLost = func(_ mqtt.Client, err error) {
			logger.Warn("EMQX Cloud MQTT terputus — akan reconnect otomatis", zap.Error(err))
		}
		mqttClient = mqtt.NewClient(opts)
		if token := mqttClient.Connect(); token.WaitTimeout(20*time.Second) {
			if token.Error() != nil {
				logger.Warn("Koneksi awal ke EMQX Cloud gagal — akan retry di background",
					zap.String("broker", cloudCfg.Broker),
					zap.Error(token.Error()),
				)
			} else {
				logger.Info("EMQX Cloud MQTT terhubung untuk sinkronisasi MANGO")
			}
		}
	}

	return &SyncService{
		cfg:        cfg,
		cloudCfg:   cloudCfg,
		postgres:   postgres,
		client:     client,
		mqttClient: mqttClient,
		status: models.MangoSyncStatus{
			Enabled: cfg.Enabled,
			SiteID:  cfg.SiteID,
			BaseURL: baseURL,
		},
	}
}

func (s *SyncService) Start(parent context.Context) {
	if !s.cfg.Enabled {
		logger.Info("MANGO sync disabled")
		return
	}

	ctx, cancel := context.WithCancel(parent)
	s.cancel = cancel

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		s.runPushLoop(ctx)
	}()

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		s.runPullLoop(ctx)
	}()
}

func (s *SyncService) Stop() {
	if s.cancel != nil {
		s.cancel()
	}
	s.wg.Wait()
}

func (s *SyncService) Status(ctx context.Context) models.MangoSyncStatus {
	s.mu.RLock()
	status := s.status
	s.mu.RUnlock()

	if s.cfg.Enabled {
		if pending, err := s.postgres.CountPendingSync(ctx); err == nil {
			status.PendingQueue = pending
		}
	}

	return status
}

func (s *SyncService) SyncStatus(ctx context.Context) error {
	if !s.cfg.Enabled {
		return nil
	}

	resp, err := s.client.R().SetContext(ctx).Get("/status")
	if err != nil {
		s.setError(err)
		return err
	}
	if resp.IsError() {
		err = fmt.Errorf("mango status HTTP %d", resp.StatusCode())
		s.setError(err)
		return err
	}
	return nil
}

func (s *SyncService) EnqueueProductionRecord(ctx context.Context, record *models.ProductionLog) error {
	payload := map[string]interface{}{
		"site_id":   s.cfg.SiteID,
		"timestamp": record.Timestamp.UTC().Format(time.RFC3339),
		"records": []map[string]interface{}{
			{
				s.cfg.FieldMapping.MachineID: record.MachineID,
				"work_order":                 record.WorkOrder,
				"part_number":                record.PartNumber,
				"shift":                      record.Shift,
				"operator_id":                record.OperatorID,
				s.cfg.FieldMapping.QtyOK:     record.QtyOK,
				s.cfg.FieldMapping.QtyNG:     record.QtyNG,
				s.cfg.FieldMapping.CycleTime: record.CycleTimeActual,
				"operating_time_min":         record.OperatingTimeMin,
				"downtime_min":               record.DowntimeMin,
				"downtime_category":          record.DowntimeCategory,
				s.cfg.FieldMapping.OEE:       record.OEE,
				"availability":               record.Availability,
				"performance":                record.Performance,
				"quality":                    record.Quality,
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return s.postgres.EnqueueSync(ctx, "production", "/production-data", record.MachineID, body)
}

func (s *SyncService) EnqueueAlarmEvent(ctx context.Context, alarm *models.AlarmEvent) error {
	if !s.cfg.PushAlarmsRealtime {
		return nil
	}

	payload := map[string]interface{}{
		"site_id":       s.cfg.SiteID,
		"resource_code": alarm.MachineID,
		"alarm_code":    alarm.Code,
		"message":       alarm.Message,
		"severity":      alarm.Severity,
		"occurred_at":   alarm.Timestamp.UTC().Format(time.RFC3339),
	}
	if alarm.ResolvedAt != nil {
		payload["resolved_at"] = alarm.ResolvedAt.UTC().Format(time.RFC3339)
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return s.postgres.EnqueueSync(ctx, "alarm", "/alarms", alarm.MachineID, body)
}

func (s *SyncService) PushQueuedEvents(ctx context.Context) error {
	items, err := s.postgres.ListPendingSync(ctx, 50)
	if err != nil {
		s.setError(err)
		return err
	}

	for _, item := range items {
		err := retry.Do(func() error {
			if s.mqttClient != nil && s.mqttClient.IsConnected() {
				// Inject api_key into payload
				var payload map[string]interface{}
				if err := json.Unmarshal(item.Payload, &payload); err == nil {
					payload["api_key"] = s.cfg.APIKey
					modifiedPayload, _ := json.Marshal(payload)
					
					topic := fmt.Sprintf("polman/edge/%s/sync/%s", s.cfg.SiteID, item.EventType)
					token := s.mqttClient.Publish(topic, s.cloudCfg.QoS, false, modifiedPayload)
					token.Wait()
					return token.Error()
				}
			}

			// Fallback to HTTP
			resp, reqErr := s.client.R().
				SetContext(ctx).
				SetBody(item.Payload).
				Post(item.Endpoint)
			if reqErr != nil {
				return reqErr
			}
			if resp.IsError() {
				return fmt.Errorf("mango sync HTTP %d on %s", resp.StatusCode(), item.Endpoint)
			}
			return nil
		},
			retry.Attempts(uint(s.maxRetries())),
			retry.Delay(s.retryDelay()),
		)
		if err != nil {
			_ = s.postgres.MarkSyncFailed(ctx, item.ID, err.Error(), s.retryDelay())
			s.setError(err)
			continue
		}

		_ = s.postgres.MarkSyncDelivered(ctx, item.ID)
		s.markPush(item.EventType)
	}

	return nil
}

func (s *SyncService) PullWorkOrders(ctx context.Context) error {
	resp, err := s.client.R().SetContext(ctx).Get("/work-orders")
	if err != nil {
		s.setError(err)
		return err
	}
	if resp.IsError() {
		err = fmt.Errorf("pull work orders HTTP %d", resp.StatusCode())
		s.setError(err)
		return err
	}

	var result struct {
		Data []map[string]interface{} `json:"data"`
	}
	body := resp.Body()
	if err := json.Unmarshal(body, &result); err != nil {
		s.setError(err)
		return err
	}

	if err := s.postgres.SaveWorkOrderPullSnapshot(ctx, body); err != nil {
		logger.Warn("Simpan snapshot work order ke PostgreSQL gagal", zap.Error(err))
	}

	s.mu.Lock()
	s.status.LastWorkOrderPull = time.Now()
	s.status.LastPulledOrders = len(result.Data)
	s.status.LastError = ""
	s.mu.Unlock()
	return nil
}

func (s *SyncService) PullMasterData(ctx context.Context) error {
	resp, err := s.client.R().SetContext(ctx).Get("/master-data")
	if err != nil {
		s.setError(err)
		return err
	}
	if resp.IsError() {
		err = fmt.Errorf("pull master data HTTP %d", resp.StatusCode())
		s.setError(err)
		return err
	}

	var result struct {
		Data struct {
			Machines []map[string]interface{} `json:"machines"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		s.setError(err)
		return err
	}

	for _, machine := range result.Data.Machines {
		id, _ := machine["resource_code"].(string)
		if id == "" {
			id, _ = machine["id"].(string)
		}
		if id == "" {
			continue
		}

		name, _ := machine["name"].(string)
		machineType, _ := machine["type"].(string)
		location, _ := machine["location"].(string)

		row := &models.MachineConfigRow{
			ID:                   id,
			Name:                 name,
			MachineType:          machineType,
			Location:             location,
			ConnectionConfigJSON: "{}",
			ProductionConfigJSON: "{}",
			MQTTTopicsJSON:       "{}",
			Enabled:              true,
		}
		if err := s.postgres.UpsertMachineMasterData(ctx, row); err != nil {
			logger.Warn("Sinkronisasi master data mesin gagal", zap.String("machine_id", id), zap.Error(err))
		}
	}

	s.mu.Lock()
	s.status.LastMasterDataPull = time.Now()
	s.status.LastPulledMachines = len(result.Data.Machines)
	s.status.LastError = ""
	s.mu.Unlock()
	return nil
}

func (s *SyncService) PushOEEData(ctx context.Context) error {
	s.mu.Lock()
	s.status.LastProductionPush = time.Now()
	s.status.LastError = ""
	s.mu.Unlock()
	return nil
}

func (s *SyncService) runPushLoop(ctx context.Context) {
	ticker := time.NewTicker(time.Duration(s.pushInterval()) * time.Second)
	defer ticker.Stop()

	for {
		if err := s.PushQueuedEvents(ctx); err != nil {
			logger.Warn("MANGO push queue gagal", zap.Error(err))
		}

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (s *SyncService) runPullLoop(ctx context.Context) {
	workOrderTicker := time.NewTicker(time.Duration(s.workOrderInterval()) * time.Second)
	masterTicker := time.NewTicker(time.Duration(s.masterDataInterval()) * time.Second)
	defer workOrderTicker.Stop()
	defer masterTicker.Stop()

	_ = s.SyncStatus(ctx)
	
	// Pull immediately on startup
	if err := s.PullWorkOrders(ctx); err != nil {
		logger.Warn("Pull work orders gagal pada startup", zap.Error(err))
	}
	if err := s.PullMasterData(ctx); err != nil {
		logger.Warn("Pull master data gagal pada startup", zap.Error(err))
	}

	for {
		select {
		case <-ctx.Done():
			return
		case <-workOrderTicker.C:
			if err := s.PullWorkOrders(ctx); err != nil {
				logger.Warn("Pull work orders gagal", zap.Error(err))
			}
		case <-masterTicker.C:
			if err := s.PullMasterData(ctx); err != nil {
				logger.Warn("Pull master data gagal", zap.Error(err))
			}
		}
	}
}

func (s *SyncService) markPush(eventType string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	switch eventType {
	case "production":
		s.status.LastProductionPush = now
	case "alarm":
		s.status.LastAlarmPush = now
	}
	s.status.LastError = ""
}

func (s *SyncService) setError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.status.LastError = err.Error()
}

func (s *SyncService) pushInterval() int {
	if s.cfg.PushProductionInterval <= 0 {
		return 60
	}
	return s.cfg.PushProductionInterval
}

func (s *SyncService) workOrderInterval() int {
	if s.cfg.PullWorkOrderInterval <= 0 {
		return 300
	}
	return s.cfg.PullWorkOrderInterval
}

func (s *SyncService) masterDataInterval() int {
	if s.cfg.PullMasterDataInterval <= 0 {
		return 3600
	}
	return s.cfg.PullMasterDataInterval
}

func (s *SyncService) retryDelay() time.Duration {
	if s.cfg.RetryDelaySeconds <= 0 {
		return 30 * time.Second
	}
	return time.Duration(s.cfg.RetryDelaySeconds) * time.Second
}

func (s *SyncService) maxRetries() int {
	if s.cfg.MaxRetries <= 0 {
		return 3
	}
	return s.cfg.MaxRetries
}
