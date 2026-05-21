package protocol

import (
	"encoding/json"
	"fmt"
	"strings"
)

func unmarshalJSON(raw string, v interface{}) error {
	s := strings.TrimSpace(raw)
	if s == "" {
		s = "{}"
	}
	if err := json.Unmarshal([]byte(s), v); err != nil {
		return fmt.Errorf("invalid connection_config json: %w", err)
	}
	return nil
}
