package protocol

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gopcua/opcua"
	"github.com/gopcua/opcua/ua"
	"github.com/yourorg/cnc-edge/internal/collector/poller"
	"github.com/yourorg/cnc-edge/internal/models"
)

type opcuaConfig struct {
	Endpoint string `json:"endpoint"`
	StatusNode   string `json:"status_node"`
	AlarmNode    string `json:"alarm_node"`
}

type opcuaPoller struct {
	config opcuaConfig
	client *opcua.Client
}

func init() {
	poller.RegisterConnector("opcua", NewOPCUAPoller)
	poller.RegisterConnector("opc-ua", NewOPCUAPoller)
}

// NewOPCUAPoller creates a new OPC-UA connector
func NewOPCUAPoller(configJSON string) (poller.Connector, error) {
	var cfg opcuaConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid opcua config: %w", err)
	}

	if cfg.Endpoint == "" {
		return nil, fmt.Errorf("endpoint is required")
	}

	ctx := context.Background()
	endpoints, err := opcua.GetEndpoints(ctx, cfg.Endpoint)
	if err != nil {
		return nil, fmt.Errorf("failed to get opcua endpoints: %w", err)
	}

	ep, err := opcua.SelectEndpoint(endpoints, ua.SecurityPolicyURINone, ua.MessageSecurityModeNone)
	if err != nil || ep == nil {
		return nil, fmt.Errorf("failed to select opcua endpoint: %v", err)
	}

	opts := []opcua.Option{
		opcua.SecurityPolicy(ua.SecurityPolicyURINone),
		opcua.SecurityMode(ua.MessageSecurityModeNone),
		opcua.AuthAnonymous(),
	}

	client, err := opcua.NewClient(ep.EndpointURL, opts...)
	if err != nil {
		return nil, err
	}

	return &opcuaPoller{
		config: cfg,
		client: client,
	}, nil
}

func (p *opcuaPoller) Connect(ctx context.Context) error {
	return p.client.Connect(ctx)
}

func (p *opcuaPoller) Disconnect(ctx context.Context) error {
	return p.client.Close(ctx)
}

func (p *opcuaPoller) ReadStatus(ctx context.Context) (*models.MachineStatus, error) {
	if p.config.StatusNode == "" {
		return nil, nil // Not configured
	}

	id, err := ua.ParseNodeID(p.config.StatusNode)
	if err != nil {
		return nil, err
	}

	req := &ua.ReadRequest{
		MaxAge: 2000,
		NodesToRead: []*ua.ReadValueID{
			{NodeID: id},
		},
		TimestampsToReturn: ua.TimestampsToReturnBoth,
	}

	resp, err := p.client.Read(ctx, req)
	if err != nil {
		return nil, err
	}

	status := &models.MachineStatus{Timestamp: time.Now()}

	if resp.Results[0].Status == ua.StatusOK {
		val := resp.Results[0].Value.Value()
		switch v := val.(type) {
		case int32:
			status.RunStatus = int(v)
		case int64:
			status.RunStatus = int(v)
		case float64:
			status.RunStatus = int(v)
		}
	}

	return status, nil
}

func (p *opcuaPoller) ReadAxis(ctx context.Context) (*models.AxisData, error) {
	return &models.AxisData{Timestamp: time.Now()}, nil
}

func (p *opcuaPoller) ReadSpindle(ctx context.Context) (*models.SpindleData, error) {
	return &models.SpindleData{Timestamp: time.Now()}, nil
}

func (p *opcuaPoller) ReadAlarms(ctx context.Context) ([]*models.AlarmEvent, error) {
	return nil, nil
}
