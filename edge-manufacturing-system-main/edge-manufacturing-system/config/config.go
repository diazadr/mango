package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	MQTT      MQTTConfig      `mapstructure:"mqtt"`
	InfluxDB  InfluxDBConfig  `mapstructure:"influxdb"`
	Postgres  PostgresConfig  `mapstructure:"postgres"`
	API       APIConfig       `mapstructure:"api"`
	CloudMQTT CloudMQTTConfig `mapstructure:"cloud_mqtt"`
	Mango     MangoConfig     `mapstructure:"mango"`
	Machines  []MachineConfig `mapstructure:"machines"`
	Topics    TopicsConfig    `mapstructure:"topics"`
	OEE       OEEConfig       `mapstructure:"oee"`
	Log       LogConfig       `mapstructure:"log"`
}

type MQTTConfig struct {
	Broker        string `mapstructure:"broker"`
	ClientID      string `mapstructure:"client_id"`
	Username      string `mapstructure:"username"`
	Password      string `mapstructure:"password"`
	CleanSession  bool   `mapstructure:"clean_session"`
	AutoReconnect bool   `mapstructure:"auto_reconnect"`
	QoSStatus     byte   `mapstructure:"qos_status"`
	QoSAxis       byte   `mapstructure:"qos_axis"`
	QoSAlarm      byte   `mapstructure:"qos_alarm"`
	QoSTool       byte   `mapstructure:"qos_tool"`
}

type CloudMQTTConfig struct {
	Enabled       bool   `mapstructure:"enabled"`
	Broker        string `mapstructure:"broker"`
	ClientID      string `mapstructure:"client_id"`
	Username      string `mapstructure:"username"`
	Password      string `mapstructure:"password"`
	TLS           bool   `mapstructure:"tls"`
	QoS           byte   `mapstructure:"qos"`
}

type InfluxDBConfig struct {
	URL           string `mapstructure:"url"`
	Token         string `mapstructure:"token"`
	Org           string `mapstructure:"org"`
	Bucket        string `mapstructure:"bucket"`
	BatchSize     int    `mapstructure:"batch_size"`
	FlushInterval int    `mapstructure:"flush_interval"`
}

type PostgresConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
}

func (p PostgresConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		p.Host, p.Port, p.User, p.Password, p.DBName, p.SSLMode,
	)
}

type APIConfig struct {
	Port         int    `mapstructure:"port"`
	GinMode      string `mapstructure:"gin_mode"`
	TemplatesDir string `mapstructure:"templates_dir"` // e.g. ./templates or /app/templates (admin UI)
}

type MangoConfig struct {
	Enabled                bool              `mapstructure:"enabled"`
	BaseURL                string            `mapstructure:"base_url"`
	APIKey                 string            `mapstructure:"api_key"`
	SiteID                 string            `mapstructure:"site_id"`
	PushProductionInterval int               `mapstructure:"push_production_interval"`
	PushOEEOnShiftEnd      bool              `mapstructure:"push_oee_on_shift_end"`
	PushAlarmsRealtime     bool              `mapstructure:"push_alarms_realtime"`
	PullWorkOrderInterval  int               `mapstructure:"pull_work_order_interval"`
	PullMasterDataInterval int               `mapstructure:"pull_master_data_interval"`
	WebhookSecret          string            `mapstructure:"webhook_secret"`
	WebhookListenPort      int               `mapstructure:"webhook_listen_port"`
	MaxRetries             int               `mapstructure:"max_retries"`
	RetryDelaySeconds      int               `mapstructure:"retry_delay_seconds"`
	FieldMapping           MangoFieldMapping `mapstructure:"field_mapping"`
}

type MangoFieldMapping struct {
	MachineID string `mapstructure:"machine_id"`
	QtyOK     string `mapstructure:"qty_ok"`
	QtyNG     string `mapstructure:"qty_ng"`
	CycleTime string `mapstructure:"cycle_time"`
	OEE       string `mapstructure:"oee"`
}

type MachineConfig struct {
	ID      string `mapstructure:"id"`
	Name    string `mapstructure:"name"`
	Type    string `mapstructure:"type"`
	Enabled bool   `mapstructure:"enabled"`
}

type TopicsConfig struct {
	Base          string `mapstructure:"base"`
	Simulator     string `mapstructure:"simulator"`
	StatusSuffix  string `mapstructure:"status_suffix"`
	AxisSuffix    string `mapstructure:"axis_suffix"`
	AlarmSuffix   string `mapstructure:"alarm_suffix"`
	ToolSuffix    string `mapstructure:"tool_suffix"`
	TimerSuffix   string `mapstructure:"timer_suffix"`
	SpindleSuffix string `mapstructure:"spindle_suffix"`
}

type OEEConfig struct {
	CalcInterval int `mapstructure:"calc_interval"`
	ShiftHours   int `mapstructure:"shift_hours"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`
	Output string `mapstructure:"output"`
}

func Load(path string) (*Config, error) {
	v := viper.New()
	v.SetConfigFile(path)
	v.SetConfigType("yaml")

	// Allow override via environment variables: CNC_MQTT_BROKER, etc.
	v.SetEnvPrefix("CNC")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("membaca config gagal: %w", err)
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config gagal: %w", err)
	}

	return &cfg, nil
}
