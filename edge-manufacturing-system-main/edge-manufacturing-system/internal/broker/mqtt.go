package broker

import (
	"crypto/tls"
	"fmt"
	"strings"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/logger"
	"go.uber.org/zap"
)

// Client wraps paho MQTT client dengan helper methods
type Client struct {
	client mqtt.Client
	cfg    config.MQTTConfig
}

// New membuat koneksi ke broker MQTT (EMQX OSS / kompatibel Mosquitto).
func New(cfg config.MQTTConfig) (*Client, error) {
	opts := mqtt.NewClientOptions()
	opts.AddBroker(cfg.Broker)
	opts.SetClientID(cfg.ClientID)
	opts.SetUsername(cfg.Username)
	opts.SetPassword(cfg.Password)
	opts.SetCleanSession(cfg.CleanSession)
	opts.SetAutoReconnect(cfg.AutoReconnect)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(5 * time.Second)
	opts.SetKeepAlive(30 * time.Second)
	opts.SetPingTimeout(10 * time.Second)

	if strings.HasPrefix(strings.ToLower(cfg.Broker), "tls://") || strings.HasPrefix(strings.ToLower(cfg.Broker), "ssl://") {
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
		logger.Info("MQTT terhubung ke broker",
			zap.String("broker", cfg.Broker),
			zap.String("client_id", cfg.ClientID),
		)
	}

	opts.OnConnectionLost = func(c mqtt.Client, err error) {
		logger.Warn("MQTT koneksi terputus — mencoba reconnect...",
			zap.Error(err),
		)
	}

	opts.OnReconnecting = func(c mqtt.Client, opts *mqtt.ClientOptions) {
		logger.Info("MQTT sedang reconnect...")
	}

	client := mqtt.NewClient(opts)

	token := client.Connect()
	if token.WaitTimeout(15*time.Second) && token.Error() != nil {
		return nil, fmt.Errorf("gagal konek ke MQTT broker %s: %w", cfg.Broker, token.Error())
	}

	return &Client{client: client, cfg: cfg}, nil
}

// Subscribe mendaftarkan handler untuk sebuah topic
func (c *Client) Subscribe(topic string, qos byte, handler mqtt.MessageHandler) error {
	token := c.client.Subscribe(topic, qos, handler)
	if token.WaitTimeout(10*time.Second) && token.Error() != nil {
		return fmt.Errorf("gagal subscribe topic %s: %w", topic, token.Error())
	}
	logger.Info("Subscribe berhasil", zap.String("topic", topic), zap.Uint8("qos", qos))
	return nil
}

// Publish mengirim pesan ke sebuah topic
func (c *Client) Publish(topic string, qos byte, retained bool, payload interface{}) error {
	token := c.client.Publish(topic, qos, retained, payload)
	if token.WaitTimeout(5*time.Second) && token.Error() != nil {
		return fmt.Errorf("gagal publish ke topic %s: %w", topic, token.Error())
	}
	return nil
}

// Disconnect menutup koneksi MQTT
func (c *Client) Disconnect() {
	c.client.Disconnect(500)
	logger.Info("MQTT disconnected")
}

// IsConnected cek apakah client terhubung
func (c *Client) IsConnected() bool {
	return c.client.IsConnected()
}

// TopicStatus menghasilkan topic untuk status mesin
func TopicStatus(base, machineType, machineID string) string {
	return fmt.Sprintf("%s/%s/%s/status", base, machineType, machineID)
}

// TopicAxis menghasilkan topic untuk data axis
func TopicAxis(base, machineType, machineID string) string {
	return fmt.Sprintf("%s/%s/%s/axis", base, machineType, machineID)
}

// TopicAlarm menghasilkan topic untuk alarm
func TopicAlarm(base, machineType, machineID string) string {
	return fmt.Sprintf("%s/%s/%s/alarm", base, machineType, machineID)
}

// TopicTool menghasilkan topic untuk tool data
func TopicTool(base, machineType, machineID string) string {
	return fmt.Sprintf("%s/%s/%s/tool", base, machineType, machineID)
}

// TopicTimer menghasilkan topic untuk timer data
func TopicTimer(base, machineType, machineID string) string {
	return fmt.Sprintf("%s/%s/%s/timer", base, machineType, machineID)
}
