package broker

import (
	"crypto/tls"
	"fmt"
	"strings"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"go.uber.org/zap"
)

// CloudClient adalah MQTT client khusus untuk EMQX Cloud.
// Bertanggung jawab untuk mempublikasikan data ke cloud
// agar MANGO platform dapat meng-consume via MQTT Cloud.
type CloudClient struct {
	mu        sync.RWMutex
	client    mqtt.Client
	cfg       config.CloudMQTTConfig
	connected bool
}

// NewCloudClient membuat koneksi ke EMQX Cloud.
// Mengembalikan nil jika cloud_mqtt.enabled = false.
func NewCloudClient(cfg config.CloudMQTTConfig) (*CloudClient, error) {
	if !cfg.Enabled {
		logger.Info("EMQX Cloud MQTT dinonaktifkan di konfigurasi")
		return nil, nil
	}

	cc := &CloudClient{cfg: cfg}

	opts := mqtt.NewClientOptions()
	opts.AddBroker(cfg.Broker)
	opts.SetClientID(cfg.ClientID)
	opts.SetUsername(cfg.Username)
	opts.SetPassword(cfg.Password)
	opts.SetCleanSession(false)
	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(10 * time.Second)
	opts.SetKeepAlive(30 * time.Second)
	opts.SetPingTimeout(10 * time.Second)

	if cfg.TLS {
		// Extract hostname for SNI
		host := strings.TrimPrefix(cfg.Broker, "tls://")
		host = strings.TrimPrefix(host, "ssl://")
		if idx := strings.Index(host, ":"); idx != -1 {
			host = host[:idx]
		}
		opts.SetTLSConfig(&tls.Config{
			ServerName:         host,
			InsecureSkipVerify: false,
			MinVersion:         tls.VersionTLS12,
		})
	}

	opts.OnConnect = func(c mqtt.Client) {
		cc.mu.Lock()
		cc.connected = true
		cc.mu.Unlock()
		logger.Info("EMQX Cloud MQTT terhubung",
			zap.String("broker", cfg.Broker),
			zap.String("client_id", cfg.ClientID),
		)
	}

	opts.OnConnectionLost = func(c mqtt.Client, err error) {
		cc.mu.Lock()
		cc.connected = false
		cc.mu.Unlock()
		logger.Warn("EMQX Cloud MQTT terputus — mencoba reconnect...",
			zap.Error(err),
		)
	}

	opts.OnReconnecting = func(c mqtt.Client, o *mqtt.ClientOptions) {
		logger.Info("EMQX Cloud MQTT sedang reconnect...")
	}

	client := mqtt.NewClient(opts)

	// Attempt connection (non-blocking jika gagal — akan retry otomatis)
	token := client.Connect()
	if token.WaitTimeout(20 * time.Second) {
		if err := token.Error(); err != nil {
			logger.Warn("EMQX Cloud: koneksi awal gagal — akan retry di background",
				zap.String("broker", cfg.Broker),
				zap.Error(err),
			)
		}
	}

	cc.client = client
	return cc, nil
}

// Publish mengirim pesan ke topic di EMQX Cloud.
func (cc *CloudClient) Publish(topic string, payload interface{}) error {
	if cc == nil || cc.client == nil {
		return fmt.Errorf("cloud MQTT client tidak aktif")
	}
	token := cc.client.Publish(topic, cc.cfg.QoS, false, payload)
	if token.WaitTimeout(5 * time.Second) && token.Error() != nil {
		return fmt.Errorf("gagal publish ke cloud topic %s: %w", topic, token.Error())
	}
	return nil
}

// IsConnected mengembalikan status koneksi cloud MQTT.
func (cc *CloudClient) IsConnected() bool {
	if cc == nil || cc.client == nil {
		return false
	}
	return cc.client.IsConnected()
}

// Disconnect menutup koneksi cloud MQTT.
func (cc *CloudClient) Disconnect() {
	if cc == nil || cc.client == nil {
		return
	}
	cc.client.Disconnect(500)
	logger.Info("EMQX Cloud MQTT disconnected")
}
