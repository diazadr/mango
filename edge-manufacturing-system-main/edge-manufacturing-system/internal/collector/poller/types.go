package poller

import (
	"context"
	"fmt"
	"sync"

	"github.com/yourorg/cnc-edge/internal/models"
)

// Connector is the interface for all machine protocol pollers
type Connector interface {
	Connect(ctx context.Context) error
	Disconnect(ctx context.Context) error
	ReadStatus(ctx context.Context) (*models.MachineStatus, error)
	ReadAxis(ctx context.Context) (*models.AxisData, error)
	ReadSpindle(ctx context.Context) (*models.SpindleData, error)
	ReadAlarms(ctx context.Context) ([]*models.AlarmEvent, error)
}

// ConnectorFactory creates a Connector from a JSON config
type ConnectorFactory func(configJSON string) (Connector, error)

var (
	registryMu sync.RWMutex
	registry   = make(map[string]ConnectorFactory)
)

// RegisterConnector registers a protocol implementation
func RegisterConnector(protocol string, factory ConnectorFactory) {
	registryMu.Lock()
	defer registryMu.Unlock()
	registry[protocol] = factory
}

// CreateConnector instantiates a connector based on protocol string
func CreateConnector(protocol, configJSON string) (Connector, error) {
	registryMu.RLock()
	factory, ok := registry[protocol]
	registryMu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("protocol %s not supported or not registered", protocol)
	}

	return factory(configJSON)
}
