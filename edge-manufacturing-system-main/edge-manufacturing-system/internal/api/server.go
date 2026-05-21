package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourorg/cnc-edge/config"
	"github.com/yourorg/cnc-edge/internal/broker"
	"github.com/yourorg/cnc-edge/internal/collector"
	"github.com/yourorg/cnc-edge/internal/collector/poller"
	"github.com/yourorg/cnc-edge/internal/logger"
	mangosync "github.com/yourorg/cnc-edge/internal/mango"
	"github.com/yourorg/cnc-edge/internal/models"
	"github.com/yourorg/cnc-edge/internal/storage"
	"go.uber.org/zap"
)

// Server adalah REST API server
type Server struct {
	influx        *storage.InfluxStore
	postgres      *storage.PostgresStore
	mango         *mangosync.SyncService
	router        *gin.Engine
	cfg           *config.Config
	collector     *collector.Collector
	pollerManager *poller.Manager
	localBroker   *broker.Client       // MQTT Lokal (EMQX OSS)
	cloudBroker   *broker.CloudClient  // MQTT Cloud (EMQX Cloud)
}

// New membuat API server baru
func New(
	influx *storage.InfluxStore,
	pg *storage.PostgresStore,
	mango *mangosync.SyncService,
	cfg *config.Config,
	col *collector.Collector,
	pollerManager *poller.Manager,
	ginMode string,
	localBroker *broker.Client,
	cloudBroker *broker.CloudClient,
) *Server {
	gin.SetMode(ginMode)

	s := &Server{
		influx:        influx,
		postgres:      pg,
		mango:         mango,
		cfg:           cfg,
		collector:     col,
		pollerManager: pollerManager,
		localBroker:   localBroker,
		cloudBroker:   cloudBroker,
	}
	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())
	r.Use(loggerMiddleware())

	v1 := r.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", s.healthCheck)

		// Status koneksi (MQTT Lokal, MQTT Cloud, PostgreSQL)
		v1.GET("/status/connections", s.connectionStatus)

		// Machines
		machines := v1.Group("/machines")
		{
			machines.GET("", s.listMachines)
			machines.GET("/:id", s.getMachine)
			machines.GET("/:id/oee", s.getMachineOEE)
		}

		// Alarms
		alarms := v1.Group("/alarms")
		{
			alarms.GET("", s.listActiveAlarms)
			alarms.GET("/history", s.alarmHistory)
			alarms.PUT("/:id/resolve", s.resolveAlarm)
		}

		// Summary untuk ERP/MES integration
		v1.GET("/summary", s.factorySummary)
		v1.GET("/mango/status", s.mangoStatus)

		production := v1.Group("/production")
		{
			production.POST("/logs", s.createProductionLog)
			production.GET("/summary", s.productionSummary)
		}

		downtime := v1.Group("/downtime")
		{
			downtime.POST("/logs", s.createDowntimeLog)
		}

		op := v1.Group("/operator")
		{
			op.GET("/list", s.operatorList)
			op.GET("/current/:machine_id", s.operatorCurrent)
			op.GET("/work-orders", s.operatorAvailableWorkOrders)
			op.POST("/checkin", s.operatorCheckin)
			op.POST("/checkout", s.operatorCheckout)
			op.GET("/downtime/open", s.operatorDowntimeOpen)
			op.POST("/downtime", s.operatorDowntime)
			op.PUT("/downtime/:id/resolve", s.operatorDowntimeResolve)
			op.POST("/scrap", s.operatorScrap)
			op.POST("/production-log", s.operatorProductionLog)
			op.GET("/production/summary", s.operatorProductionSummary)
			op.GET("/master-reasons", s.operatorMasterReasons)
		}

		v1.POST("/webhooks/mango", s.webhookMango)
	}

	// Operator Terminal HTML Route
	r.GET("/operator/:id", s.operatorTerminalHTML)

	s.registerAdminRoutes(r)

	s.router = r
}

// Run menjalankan HTTP server
func (s *Server) Run(addr string) error {
	logger.Info("API Server dimulai", zap.String("addr", addr))
	return s.router.Run(addr)
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

func (s *Server) healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "mango-edge",
		"site":    "POLMAN_BANDUNG_EDGE",
	})
}

// connectionStatus mengembalikan status koneksi semua broker/infrastruktur.
func (s *Server) connectionStatus(c *gin.Context) {
	mqttLocalOK := s.localBroker != nil && s.localBroker.IsConnected()
	mqttCloudOK := s.cloudBroker != nil && s.cloudBroker.IsConnected()

	// PostgreSQL ping
	pgOK := false
	if s.postgres != nil {
		pgCtx := c.Request.Context()
		_, pgErr := s.postgres.ListActiveAlarms(pgCtx)
		pgOK = pgErr == nil
	}

	c.JSON(http.StatusOK, gin.H{
		"connections": gin.H{
			"mqtt_local": gin.H{
				"name":      "EMQX Lokal",
				"broker":    s.cfg.MQTT.Broker,
				"connected": mqttLocalOK,
				"protocol":  "MQTT",
			},
			"mqtt_cloud": gin.H{
				"name":      "EMQX Cloud",
				"broker":    s.cfg.CloudMQTT.Broker,
				"connected": mqttCloudOK,
				"enabled":   s.cfg.CloudMQTT.Enabled,
				"protocol":  "MQTT over TLS",
			},
			"postgresql": gin.H{
				"name":      "PostgreSQL",
				"host":      s.cfg.Postgres.Host,
				"connected": pgOK,
				"protocol":  "PostgreSQL",
			},
			"influxdb": gin.H{
				"name":      "InfluxDB",
				"url":       s.cfg.InfluxDB.URL,
				"connected": s.influx != nil,
				"protocol":  "HTTP/InfluxDB",
			},
		},
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func (s *Server) listMachines(c *gin.Context) {
	rows, err := s.postgres.ListMachineConfigs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":  rows,
		"total": len(rows),
	})
}

func (s *Server) getMachine(c *gin.Context) {
	machineID := c.Param("id")
	row, err := s.postgres.GetMachineConfig(c.Request.Context(), machineID)
	if err != nil || row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "mesin tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": row})
}

func (s *Server) resolveAlarm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "alarm ID tidak valid"})
		return
	}

	if err := s.postgres.ResolveAlarm(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "alarm resolved", "id": id})
}

func (s *Server) factorySummary(c *gin.Context) {
	ctx := c.Request.Context()

	activeAlarms, _ := s.postgres.ListActiveAlarms(ctx)
	rows, _ := s.postgres.ListMachineConfigs(ctx)

	c.JSON(http.StatusOK, gin.H{
		"summary": gin.H{
			"total_machines":  len(rows),
			"active_alarms":   len(activeAlarms),
		},
		"machines": rows,
	})
}

func (s *Server) mangoStatus(c *gin.Context) {
	if s.mango == nil {
		c.JSON(http.StatusOK, gin.H{
			"enabled": false,
			"message": "MANGO sync service not configured",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": s.mango.Status(c.Request.Context())})
}

func (s *Server) createProductionLog(c *gin.Context) {
	var req models.ProductionLog
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.MachineID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "machine_id wajib diisi"})
		return
	}
	if req.Timestamp.IsZero() {
		req.Timestamp = time.Now()
	}
	if req.MachineName == "" {
		req.MachineName = req.MachineID
	}

	id, err := s.postgres.InsertProductionLog(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.ID = id

	if s.mango != nil {
		if err := s.mango.EnqueueProductionRecord(c.Request.Context(), &req); err != nil {
			logger.Warn("Enqueue production ke MANGO gagal", zap.Error(err))
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "production log stored",
		"data":    req,
	})
}

func (s *Server) productionSummary(c *gin.Context) {
	machineID := c.Query("machine_id")
	shift, _ := strconv.Atoi(c.DefaultQuery("shift", "0"))
	dateValue := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	day, err := time.Parse("2006-01-02", dateValue)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format date harus YYYY-MM-DD"})
		return
	}

	summary, err := s.postgres.GetProductionSummary(c.Request.Context(), machineID, day, shift)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": summary})
}

func (s *Server) createDowntimeLog(c *gin.Context) {
	var req models.DowntimeLog
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.MachineID == "" || req.Category == "" || req.StartedAt.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "machine_id, category, started_at wajib diisi"})
		return
	}

	id, err := s.postgres.InsertDowntimeLog(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.ID = id

	c.JSON(http.StatusCreated, gin.H{
		"message": "downtime log stored",
		"data":    req,
	})
}

// ─── Middleware ───────────────────────────────────────────────────────────────

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func loggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		logger.Debug("HTTP request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
		)
	}
}

// getMachineOEE returns latest OEE metrics for a specific machine from InfluxDB.
func (s *Server) getMachineOEE(c *gin.Context) {
	machineID := c.Param("id")
	ctx := c.Request.Context()

	summary, err := s.postgres.GetProductionSummary(ctx, machineID, time.Now(), 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"machine_id": machineID,
		"data":       summary,
	})
}

// listActiveAlarms returns all open (unresolved) alarms.
func (s *Server) listActiveAlarms(c *gin.Context) {
	ctx := c.Request.Context()
	alarms, err := s.postgres.ListActiveAlarms(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": alarms, "total": len(alarms)})
}

// alarmHistory returns all alarms (paginated) ordered by newest first.
func (s *Server) alarmHistory(c *gin.Context) {
	ctx := c.Request.Context()
	// Reuse ListActiveAlarms for now; can be extended with pagination later.
	alarms, err := s.postgres.ListActiveAlarms(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": alarms, "total": len(alarms)})
}

