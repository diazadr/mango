package protocol

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/yourorg/cnc-edge/internal/collector/poller"
	"github.com/yourorg/cnc-edge/internal/models"
)

type mtconnectConfig struct {
	AgentURL string `json:"agent_url"`
}

type mtconnectPoller struct {
	config mtconnectConfig
	client *http.Client
}

func init() {
	poller.RegisterConnector("mtconnect", NewMTConnectPoller)
	poller.RegisterConnector("http", NewMTConnectPoller)
	poller.RegisterConnector("rest", NewMTConnectPoller)
}

// NewMTConnectPoller creates a new MTConnect connector
func NewMTConnectPoller(configJSON string) (poller.Connector, error) {
	var cfg mtconnectConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid mtconnect config: %w", err)
	}

	if cfg.AgentURL == "" {
		return nil, fmt.Errorf("agent_url is required")
	}

	return &mtconnectPoller{
		config: cfg,
		client: &http.Client{Timeout: 5 * time.Second},
	}, nil
}

func (p *mtconnectPoller) Connect(ctx context.Context) error {
	// MTConnect is stateless HTTP, no persistent connection needed
	// We can do a ping/probe
	u := strings.TrimRight(p.config.AgentURL, "/") + "/probe"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	resp, err := p.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return fmt.Errorf("mtconnect probe HTTP %d", resp.StatusCode)
	}
	return nil
}

func (p *mtconnectPoller) Disconnect(ctx context.Context) error {
	return nil
}

func (p *mtconnectPoller) ReadStatus(ctx context.Context) (*models.MachineStatus, error) {
	// Parse current stream
	u := strings.TrimRight(p.config.AgentURL, "/") + "/current"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Simplistic XML parsing for demonstration
	// In reality, MTConnectStreams XML is complex
	type ComponentStream struct {
		Events struct {
			Execution string `xml:"Execution"`
			Estop     string `xml:"EmergencyStop"`
		} `xml:"Events"`
	}
	type MTConnectStreams struct {
		Streams struct {
			DeviceStream struct {
				ComponentStreams []ComponentStream `xml:"ComponentStream"`
			} `xml:"DeviceStream"`
		} `xml:"Streams"`
	}

	var streams MTConnectStreams
	if err := xml.NewDecoder(resp.Body).Decode(&streams); err != nil {
		return nil, err
	}

	status := &models.MachineStatus{
		Timestamp: time.Now(),
	}

	for _, cs := range streams.Streams.DeviceStream.ComponentStreams {
		if cs.Events.Execution == "ACTIVE" {
			status.RunStatus = 2
		} else if cs.Events.Execution == "STOPPED" || cs.Events.Execution == "INTERRUPTED" {
			status.RunStatus = 0
		} else if cs.Events.Execution == "READY" {
			status.RunStatus = 1
		}

		if cs.Events.Estop == "TRIGGERED" {
			status.Emergency = 1
		}
	}

	return status, nil
}

func (p *mtconnectPoller) ReadAxis(ctx context.Context) (*models.AxisData, error) {
	// Implementation would parse Samples for Position (X, Y, Z)
	return &models.AxisData{Timestamp: time.Now()}, nil
}

func (p *mtconnectPoller) ReadSpindle(ctx context.Context) (*models.SpindleData, error) {
	// Implementation would parse Samples for RotaryVelocity, Load
	return &models.SpindleData{Timestamp: time.Now()}, nil
}

func (p *mtconnectPoller) ReadAlarms(ctx context.Context) ([]*models.AlarmEvent, error) {
	// Implementation would parse Events for Condition (Warning/Fault)
	return nil, nil
}
