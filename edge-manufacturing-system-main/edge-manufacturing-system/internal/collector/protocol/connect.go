// Package protocol provides lightweight connectivity checks for industrial protocols.
// Full polling implementations belong in internal/collector (Modbus: github.com/goburrow/modbus,
// OPC-UA: github.com/gopcua/opcua, FOCAS: build tag focas + Fanuc fwlib).
package protocol

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// TestConnection runs a minimal handshake for the given protocol (from JSON connection_config).
func TestConnection(ctx context.Context, protocol string, connectionJSON string) error {
	p := strings.ToLower(strings.TrimSpace(protocol))
	switch p {
	case "modbus", "modbus_tcp":
		return testModbusTCP(ctx, connectionJSON)
	case "opcua", "opc-ua":
		return testOPCUATCP(ctx, connectionJSON)
	case "mtconnect":
		return testMTConnect(ctx, connectionJSON)
	case "mqtt", "http", "rest", "simulator":
		return nil
	case "focas", "focas2":
		return testFOCAS(ctx, connectionJSON)
	default:
		return fmt.Errorf("unknown protocol for test: %s", protocol)
	}
}

type modbusConn struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

func testModbusTCP(ctx context.Context, raw string) error {
	var cfg modbusConn
	if err := unmarshalJSON(raw, &cfg); err != nil {
		return err
	}
	if cfg.Host == "" {
		cfg.Host = "127.0.0.1"
	}
	if cfg.Port == 0 {
		cfg.Port = 502
	}
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return fmt.Errorf("modbus tcp dial %s: %w", addr, err)
	}
	_ = conn.Close()
	return nil
}

type opcuaConn struct {
	Endpoint string `json:"endpoint"`
}

func testOPCUATCP(ctx context.Context, raw string) error {
	var cfg opcuaConn
	if err := unmarshalJSON(raw, &cfg); err != nil {
		return err
	}
	if cfg.Endpoint == "" {
		return fmt.Errorf("opcua: endpoint required")
	}
	u, err := url.Parse(cfg.Endpoint)
	if err != nil {
		return err
	}
	host := u.Hostname()
	port := u.Port()
	if port == "" {
		port = "4840"
	}
	addr := net.JoinHostPort(host, port)
	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return fmt.Errorf("opcua tcp dial %s: %w", addr, err)
	}
	_ = conn.Close()
	return nil
}

type mtconnectConn struct {
	AgentURL string `json:"agent_url"`
}

func testMTConnect(ctx context.Context, raw string) error {
	var cfg mtconnectConn
	if err := unmarshalJSON(raw, &cfg); err != nil {
		return err
	}
	if cfg.AgentURL == "" {
		return fmt.Errorf("mtconnect: agent_url required")
	}
	u := strings.TrimRight(cfg.AgentURL, "/") + "/probe"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("mtconnect probe: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return fmt.Errorf("mtconnect HTTP %d", resp.StatusCode)
	}
	return nil
}
