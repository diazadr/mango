package protocol

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/goburrow/modbus"
	"github.com/yourorg/cnc-edge/internal/collector/poller"
	"github.com/yourorg/cnc-edge/internal/models"
)

type modbusConfig struct {
	Host   string `json:"host"`
	Port   int    `json:"port"`
	UnitID byte   `json:"unit_id"`
}

type modbusPoller struct {
	config  modbusConfig
	handler *modbus.TCPClientHandler
	client  modbus.Client
}

func init() {
	poller.RegisterConnector("modbus", NewModbusPoller)
	poller.RegisterConnector("modbus_tcp", NewModbusPoller)
}

// NewModbusPoller creates a new Modbus TCP connector
func NewModbusPoller(configJSON string) (poller.Connector, error) {
	var cfg modbusConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid modbus config: %w", err)
	}

	if cfg.Host == "" {
		cfg.Host = "127.0.0.1"
	}
	if cfg.Port == 0 {
		cfg.Port = 502
	}
	if cfg.UnitID == 0 {
		cfg.UnitID = 1
	}

	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	handler := modbus.NewTCPClientHandler(addr)
	handler.Timeout = 5 * time.Second
	handler.SlaveId = cfg.UnitID

	return &modbusPoller{
		config:  cfg,
		handler: handler,
		client:  modbus.NewClient(handler),
	}, nil
}

func (p *modbusPoller) Connect(ctx context.Context) error {
	return p.handler.Connect()
}

func (p *modbusPoller) Disconnect(ctx context.Context) error {
	return p.handler.Close()
}

func (p *modbusPoller) ReadStatus(ctx context.Context) (*models.MachineStatus, error) {
	// Example: reading holding register 0 for Run Status, 1 for Alarm, 2 for Emergency
	results, err := p.client.ReadHoldingRegisters(0, 3)
	if err != nil {
		return nil, err
	}

	status := &models.MachineStatus{
		Timestamp: time.Now(),
	}

	if len(results) >= 6 { // 2 bytes per register
		status.RunStatus = int(uint16(results[0])<<8 | uint16(results[1]))
		status.Alarm = int(uint16(results[2])<<8 | uint16(results[3]))
		status.Emergency = int(uint16(results[4])<<8 | uint16(results[5]))
	}

	return status, nil
}

func (p *modbusPoller) ReadAxis(ctx context.Context) (*models.AxisData, error) {
	// Example: reading holding registers 10-15 for X, Y, Z
	results, err := p.client.ReadHoldingRegisters(10, 6)
	if err != nil {
		return nil, err
	}

	axis := &models.AxisData{
		Timestamp: time.Now(),
	}

	if len(results) >= 12 {
		axis.AbsX = float64(uint16(results[0])<<8 | uint16(results[1])) / 1000.0
		axis.AbsY = float64(uint16(results[2])<<8 | uint16(results[3])) / 1000.0
		axis.AbsZ = float64(uint16(results[4])<<8 | uint16(results[5])) / 1000.0
	}

	return axis, nil
}

func (p *modbusPoller) ReadSpindle(ctx context.Context) (*models.SpindleData, error) {
	return &models.SpindleData{Timestamp: time.Now()}, nil
}

func (p *modbusPoller) ReadAlarms(ctx context.Context) ([]*models.AlarmEvent, error) {
	return nil, nil
}
