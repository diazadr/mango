package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/api"
	"github.com/yourorg/cnc-edge/internal/broker"
	"github.com/yourorg/cnc-edge/internal/collector"
	"github.com/yourorg/cnc-edge/internal/collector/poller"
	_ "github.com/yourorg/cnc-edge/internal/collector/protocol" // Register protocols
	"github.com/yourorg/cnc-edge/internal/logger"
	mangosync "github.com/yourorg/cnc-edge/internal/mango"
	"github.com/yourorg/cnc-edge/internal/oee"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
)

func main() {
	// ── 1. Load konfigurasi ──────────────────────────────────────────────────
	cfgPath := "config/config.yaml"
	if v := os.Getenv("CNC_CONFIG"); v != "" {
		cfgPath = v
	}

	cfg, err := config.Load(cfgPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: load config gagal: %v\n", err)
		os.Exit(1)
	}

	// ── 2. Init logger ───────────────────────────────────────────────────────
	if err := logger.Init(cfg.Log.Level, cfg.Log.Output); err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: init logger gagal: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	logger.Info("═══════════════════════════════════════")
	logger.Info("  MANGO Edge System — Starting up")
	logger.Info("  Politeknik Manufaktur Bandung")
	logger.Info("═══════════════════════════════════════")

	// ── 3. Koneksi ke InfluxDB ───────────────────────────────────────────────
	influxStore, err := storage.NewInflux(cfg.InfluxDB)
	if err != nil {
		logger.Fatal("InfluxDB gagal konek", zap.Error(err))
	}
	defer influxStore.Close()

	// ── 4. Koneksi ke PostgreSQL ─────────────────────────────────────────────
	pgStore, err := storage.NewPostgres(cfg.Postgres)
	if err != nil {
		logger.Fatal("PostgreSQL gagal konek", zap.Error(err))
	}
	defer pgStore.Close()

	// ── 4b. Koneksi ke EMQX Cloud (opsional, non-fatal) ─────────────────────
	cloudClient, cloudErr := broker.NewCloudClient(cfg.CloudMQTT)
	if cloudErr != nil {
		logger.Warn("EMQX Cloud client gagal diinit — fitur cloud publish dinonaktifkan", zap.Error(cloudErr))
	}
	if cloudClient != nil {
		defer cloudClient.Disconnect()
	}

	mangoSync := mangosync.New(cfg.Mango, cfg.CloudMQTT, pgStore)
	mangoSync.Start(context.Background())
	defer mangoSync.Stop()

	// ── 5. Koneksi ke MQTT Broker Lokal ──────────────────────────────────────
	mqttClient, err := broker.New(cfg.MQTT)
	if err != nil {
		logger.Fatal("MQTT broker utama gagal konek", zap.Error(err))
	}
	defer mqttClient.Disconnect()

	// ── 6. Mulai Collector (subscribe semua topic MQTT) ──────────────────────
	col := collector.New(mqttClient, influxStore, pgStore, mangoSync, cfg)
	if err := col.Start(); err != nil {
		logger.Fatal("Collector gagal start", zap.Error(err))
	}

	// ── 7. Mulai Poller Manager (publish ke MQTT) ───────────────────────────
	pollerManager := poller.NewManager(mqttClient, pgStore)
	if err := pollerManager.Start(); err != nil {
		logger.Warn("PollerManager start warning (will retry later)", zap.Error(err))
	}
	defer pollerManager.Stop()

	// ── 8. Mulai OEE Calculator ──────────────────────────────────────────────
	oeeCalc := oee.New(influxStore, pgStore, cfg)
	oeeCalc.SetMangoSync(mangoSync) // Push OEE data ke MANGO sync queue
	oeeCalc.Start()
	defer oeeCalc.Stop()

	// ── 9. Mulai REST API server (goroutine) ─────────────────────────────────
	apiServer := api.New(influxStore, pgStore, mangoSync, cfg, col, pollerManager, cfg.API.GinMode, mqttClient, cloudClient)
	go func() {
		addr := fmt.Sprintf(":%d", cfg.API.Port)
		if err := apiServer.Run(addr); err != nil {
			logger.Fatal("API server error", zap.Error(err))
		}
	}()

	logger.Info("Semua komponen aktif — menunggu data mesin...",
		zap.String("dashboard", fmt.Sprintf("http://localhost:%d/", cfg.API.Port)),
		zap.String("api", fmt.Sprintf("http://localhost:%d/api/v1", cfg.API.Port)),
		zap.String("mqtt_broker", cfg.MQTT.Broker),
		zap.Bool("cloud_mqtt_aktif", cloudClient != nil && cloudClient.IsConnected()),
	)

	// ── 10. Graceful shutdown saat CTRL+C atau SIGTERM ───────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	logger.Info("Sinyal shutdown diterima — menutup semua koneksi...",
		zap.String("signal", sig.String()),
	)
	logger.Info("CNC Edge System berhenti dengan bersih.")
}
