package protocol

import (
	"context"
	"math/rand"
	"time"

	"github.com/yourorg/cnc-edge/internal/collector/poller"
	"github.com/yourorg/cnc-edge/internal/models"
)

type simulatorPoller struct {
	rnd *rand.Rand
}

func init() {
	poller.RegisterConnector("simulator", NewSimulatorPoller)
}

// NewSimulatorPoller creates a new simulator connector that generates random data
func NewSimulatorPoller(configJSON string) (poller.Connector, error) {
	return &simulatorPoller{
		rnd: rand.New(rand.NewSource(time.Now().UnixNano())),
	}, nil
}

func (p *simulatorPoller) Connect(ctx context.Context) error {
	return nil // Simulator is always connected
}

func (p *simulatorPoller) Disconnect(ctx context.Context) error {
	return nil
}

func (p *simulatorPoller) ReadStatus(ctx context.Context) (*models.MachineStatus, error) {
	// Simulator mostly stays in RUNNING state (3) to simulate active production
	// Occasionally drops to IDLE (1) or ALARM (4)
	runStatus := 3
	n := p.rnd.Intn(100)
	if n < 5 {
		runStatus = 1 // 5% chance of IDLE
	}

	return &models.MachineStatus{
		Timestamp: time.Now(),
		RunStatus: runStatus,
		Alarm:     0,
		Emergency: 0,
	}, nil
}

func (p *simulatorPoller) ReadAxis(ctx context.Context) (*models.AxisData, error) {
	// Generate random axis movements
	return &models.AxisData{
		Timestamp: time.Now(),
		AbsX:      -500.0 + (p.rnd.Float64() * 1000.0), // -500 to 500
		AbsY:      -300.0 + (p.rnd.Float64() * 600.0),  // -300 to 300
		AbsZ:      -200.0 + (p.rnd.Float64() * 400.0),  // -200 to 200
		RelX:      -10.0 + (p.rnd.Float64() * 20.0),
		RelY:      -10.0 + (p.rnd.Float64() * 20.0),
		RelZ:      -10.0 + (p.rnd.Float64() * 20.0),
	}, nil
}

func (p *simulatorPoller) ReadSpindle(ctx context.Context) (*models.SpindleData, error) {
	// Generate random spindle speed between 1200 and 1500
	speed := 1200.0 + (p.rnd.Float64() * 300.0)
	
	// Add some random load between 20% and 60%
	load := 20.0 + (p.rnd.Float64() * 40.0)

	return &models.SpindleData{
		Timestamp:    time.Now(),
		SpeedActual:  speed,
		LoadPercent:  load,
	}, nil
}

func (p *simulatorPoller) ReadAlarms(ctx context.Context) ([]*models.AlarmEvent, error) {
	// Simulator rarely generates alarms
	return nil, nil
}
