//go:build !focas

package protocol

import (
	"context"
	"fmt"

	"github.com/yourorg/cnc-edge/internal/collector/poller"
)

func init() {
	poller.RegisterConnector("focas", NewFOCASPoller)
	poller.RegisterConnector("focas2", NewFOCASPoller)
}

// NewFOCASPoller creates a stub for non-CGO builds
func NewFOCASPoller(configJSON string) (poller.Connector, error) {
	return nil, fmt.Errorf("FOCAS2 is not supported in this build. Compile with -tags focas and CGO enabled")
}

// These methods won't be called because NewFOCASPoller returns an error
func testFOCAS(ctx context.Context, raw string) error {
	return fmt.Errorf("FOCAS2 is not supported in this build")
}
