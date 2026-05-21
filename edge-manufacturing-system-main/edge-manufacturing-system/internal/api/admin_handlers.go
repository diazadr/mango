package api

import (
	"encoding/json"
	"math"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"html/template"

	"github.com/gin-gonic/gin"
	"github.com/yourorg/cnc-edge/internal/collector/protocol"
	"github.com/yourorg/cnc-edge/internal/models"
)

// registerAdminRoutes wires HTML admin UI + JSON CRUD for machine_configs.
func (s *Server) registerAdminRoutes(r *gin.Engine) {
	r.SetFuncMap(template.FuncMap{
		"add": func(a, b int) int { return a + b },
		"sub": func(a, b int) int { return a - b },
	})
	
	if s.cfg != nil && s.cfg.API.TemplatesDir != "" {
		pattern := filepath.Join(s.cfg.API.TemplatesDir, "admin", "*.html")
		r.LoadHTMLGlob(pattern)
	}

	r.GET("/", s.adminDashboardHTML)
	r.GET("/machines", s.adminMachineListHTML)
	r.GET("/machines/new", s.adminMachineFormHTML)
	r.GET("/machines/:id/edit", s.adminMachineEditHTML)
	r.POST("/machines/save", s.adminMachineSaveHTML)
	r.POST("/machines/:id/delete", s.adminMachineDeleteHTML)
	r.GET("/connection-logs", s.adminConnectionLogsHTML)
	r.GET("/work-orders", s.adminWorkOrdersHTML)
	r.GET("/production-history", s.adminProductionHistoryHTML)
	r.GET("/downtime-history", s.adminDowntimeHistoryHTML)
	r.GET("/operator-history", s.adminCheckinHistoryHTML)
	r.GET("/scrap-history", s.adminScrapHistoryHTML)
	r.POST("/work-orders/sync", s.adminSyncWorkOrdersHTML)
	r.POST("/master-data/sync", s.adminSyncMasterDataHTML)

	// Admin API JSON (dipakai AJAX atau system)
	a := r.Group("/api/v1/admin")
	{
		a.GET("/machine-configs", s.adminListMachineConfigsJSON)
		a.POST("/machine-configs", s.adminUpsertMachineConfigJSON)
		a.DELETE("/machine-configs/:id", s.adminDeleteMachineConfigJSON)
		a.POST("/machine-configs/:id/test-connection", s.adminTestConnectionJSON)
		a.POST("/reload-cache", s.adminReloadCache)
	}
}

func (s *Server) adminDashboardHTML(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func (s *Server) adminProductionHistoryHTML(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	logs, total, err := s.postgres.ListOperatorCheckins(c.Request.Context(), limit, offset)
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil riwayat produksi: "+err.Error())
		return
	}

	totalPages := total / limit
	if total%limit != 0 {
		totalPages++
	}

	c.HTML(http.StatusOK, "production_history.html", gin.H{
		"Title":      "Riwayat Produksi & Work Order",
		"Logs":       logs,
		"Page":       page,
		"TotalPages": totalPages,
	})
}

func (s *Server) adminDowntimeHistoryHTML(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	logs, total, err := s.postgres.ListDowntimeLogs(c.Request.Context(), limit, offset)
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil riwayat downtime: "+err.Error())
		return
	}

	totalPages := total / limit
	if total%limit != 0 {
		totalPages++
	}

	c.HTML(http.StatusOK, "downtime_history.html", gin.H{
		"Title":      "Riwayat Kerusakan Mesin",
		"Logs":       logs,
		"Page":       page,
		"TotalPages": totalPages,
	})
}

func (s *Server) adminCheckinHistoryHTML(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	checkins, total, err := s.postgres.ListOperatorCheckins(c.Request.Context(), limit, offset)
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil riwayat checkin: "+err.Error())
		return
	}

	totalPages := total / limit
	if total%limit != 0 {
		totalPages++
	}

	c.HTML(http.StatusOK, "checkin_history.html", gin.H{
		"Title":      "Riwayat Eksekusi Work Order",
		"Checkins":   checkins,
		"Page":       page,
		"TotalPages": totalPages,
	})
}

func (s *Server) adminScrapHistoryHTML(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	logs, total, err := s.postgres.ListScrapLogs(c.Request.Context(), limit, offset)
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil riwayat reject: "+err.Error())
		return
	}

	totalPages := total / limit
	if total%limit != 0 {
		totalPages++
	}

	c.HTML(http.StatusOK, "scrap_history.html", gin.H{
		"Title":      "Riwayat Reject Produksi",
		"Logs":       logs,
		"Page":       page,
		"TotalPages": totalPages,
	})
}

func (s *Server) adminWorkOrdersHTML(c *gin.Context) {
	payload, err := s.postgres.GetLatestWorkOrderPullSnapshot(c.Request.Context())
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil data dari database: "+err.Error())
		return
	}

	// Default empty list
	var result struct {
		Data []map[string]interface{} `json:"data"`
	}

	if payload != nil {
		if err := json.Unmarshal(payload, &result); err != nil {
			c.String(http.StatusInternalServerError, "Gagal mem-parsing JSON: "+err.Error())
			return
		}
	}

	c.HTML(http.StatusOK, "work_orders.html", gin.H{
		"WorkOrders": result.Data,
		"HasData":    payload != nil,
	})
}

func (s *Server) adminConnectionLogsHTML(c *gin.Context) {
	machineID := c.Query("machine_id")
	eventType := c.Query("event_type")

	pageStr := c.Query("page")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit := 50
	offset := (page - 1) * limit

	logs, total, err := s.postgres.ListConnectionLogs(c.Request.Context(), machineID, eventType, limit, offset)
	if err != nil {
		c.String(http.StatusInternalServerError, "Gagal mengambil log koneksi: "+err.Error())
		return
	}

	machines, _ := s.postgres.ListMachineConfigs(c.Request.Context())

	// Simple stats for the current page view
	var countOK, countFail, countDisconnect, countSim int
	for _, l := range logs {
		if l.EventType == "connected" {
			countOK++
		} else if l.EventType == "error" || l.EventType == "timeout" {
			countFail++
		} else if l.EventType == "disconnected" {
			countDisconnect++
		}
		if l.IsSimulator {
			countSim++
		}
	}

	lastPage := int(math.Ceil(float64(total) / float64(limit)))
	if lastPage < 1 {
		lastPage = 1
	}
	
	pageStart := offset + 1
	if len(logs) == 0 {
		pageStart = 0
	}

	c.HTML(http.StatusOK, "connection_logs.html", gin.H{
		"Logs":            logs,
		"Machines":        machines,
		"FilterMachineID": machineID,
		"FilterEventType": eventType,
		"TotalLogs":       total,
		"CountOK":         countOK,
		"CountFail":       countFail,
		"CountDisconnect": countDisconnect,
		"CountSimulator":  countSim,
		"Page":            page,
		"PrevPage":        page - 1,
		"NextPage":        page + 1,
		"LastPage":        lastPage,
		"PageStart":       pageStart,
		"PageEnd":         offset + len(logs),
	})
}

func (s *Server) adminSyncWorkOrdersHTML(c *gin.Context) {
	if s.mango != nil {
		if err := s.mango.PullWorkOrders(c.Request.Context()); err != nil {
			c.String(http.StatusInternalServerError, "Gagal sinkronisasi dengan MANGO ERP: "+err.Error())
			return
		}
	}
	c.Redirect(http.StatusFound, "/work-orders")
}

func (s *Server) adminReloadCache(c *gin.Context) {
	if s.collector == nil {
		c.JSON(http.StatusOK, gin.H{"message": "collector not wired"})
		return
	}
	if err := s.collector.RefreshMachineCacheFromPostgres(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if s.pollerManager != nil {
		if err := s.pollerManager.Reload(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reload poller: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "machine name cache and pollers refreshed"})
}

func (s *Server) adminSyncMasterDataHTML(c *gin.Context) {
	if s.mango == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "MANGO sync service not wired"})
		return
	}

	if err := s.mango.PullMasterData(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if s.collector != nil {
		_ = s.collector.RefreshMachineCacheFromPostgres()
	}
	if s.pollerManager != nil {
		_ = s.pollerManager.Reload()
	}

	status := s.mango.Status(c.Request.Context())
	c.JSON(http.StatusOK, gin.H{
		"message":             "master data MANGO berhasil disinkronkan",
		"last_pulled_machines": status.LastPulledMachines,
	})
}

func (s *Server) adminMachineListHTML(c *gin.Context) {
	ctx := c.Request.Context()
	search := c.Query("search")
	pageStr := c.DefaultQuery("page", "1")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 { page = 1 }
	perPage := 10

	allRows, err := s.postgres.ListMachineConfigs(ctx)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	// Filter
	filtered := make([]models.MachineConfigRow, 0)
	active, sim := 0, 0
	for _, r := range allRows {
		match := true
		if search != "" {
			match = strings.Contains(strings.ToLower(r.Name), strings.ToLower(search)) || 
			        strings.Contains(strings.ToLower(r.ID), strings.ToLower(search))
		}

		if match {
			filtered = append(filtered, r)
		}

		if r.Enabled { active++ }
		if r.Protocol == "simulator" { sim++ }
	}

	// Paginate
	total := len(filtered)
	start := (page - 1) * perPage
	end := start + perPage
	if start > total { start = total }
	if end > total { end = total }

	paginated := filtered[start:end]

	c.HTML(http.StatusOK, "machines.html", gin.H{
		"Machines":    paginated,
		"Active":      active,
		"Sim":         sim,
		"Search":      search,
		"CurrentPage": page,
		"TotalPages":  (total + perPage - 1) / perPage,
		"TotalItems":  total,
	})
}

func (s *Server) adminMachineFormHTML(c *gin.Context) {
	c.HTML(http.StatusOK, "machine_form.html", gin.H{
		"Machine": models.MachineConfigRow{
			ConnectionConfigJSON: "{}",
			ProductionConfigJSON: "{}",
			MQTTTopicsJSON:       "{}",
			Enabled:              true,
		},
		"IsNew": true,
	})
}

func (s *Server) adminMachineEditHTML(c *gin.Context) {
	id := c.Param("id")
	row, err := s.postgres.GetMachineConfig(c.Request.Context(), id)
	if err != nil || row == nil {
		c.String(http.StatusNotFound, "machine not found")
		return
	}
	c.HTML(http.StatusOK, "machine_form.html", gin.H{"Machine": row, "IsNew": false})
}

func (s *Server) adminMachineSaveHTML(c *gin.Context) {
	enabled := c.PostForm("enabled") == "on" || c.PostForm("enabled") == "true"
	row := models.MachineConfigRow{
		ID:                   c.PostForm("id"),
		Name:                 c.PostForm("name"),
		MachineType:          c.PostForm("machine_type"),
		Protocol:             c.PostForm("protocol"),
		Location:             c.PostForm("location"),
		ConnectionConfigJSON:   c.PostForm("connection_config"),
		ProductionConfigJSON: c.PostForm("production_config"),
		MQTTTopicsJSON:       c.PostForm("mqtt_topics"),
		Enabled:              enabled,
	}
	if row.ConnectionConfigJSON == "" {
		row.ConnectionConfigJSON = "{}"
	}
	if row.ProductionConfigJSON == "" {
		row.ProductionConfigJSON = "{}"
	}
	if row.MQTTTopicsJSON == "" {
		row.MQTTTopicsJSON = "{}"
	}
	if err := s.postgres.UpsertMachineConfig(c.Request.Context(), &row); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	if s.collector != nil {
		_ = s.collector.RefreshMachineCacheFromPostgres()
	}
	if s.pollerManager != nil {
		_ = s.pollerManager.Reload()
	}
	c.Redirect(http.StatusFound, "/machines")
}

func (s *Server) adminMachineDeleteHTML(c *gin.Context) {
	id := c.Param("id")
	if err := s.postgres.DeleteMachineConfig(c.Request.Context(), id); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	if s.collector != nil {
		_ = s.collector.RefreshMachineCacheFromPostgres()
	}
	if s.pollerManager != nil {
		_ = s.pollerManager.Reload()
	}
	c.Redirect(http.StatusFound, "/machines")
}

func (s *Server) adminListMachineConfigsJSON(c *gin.Context) {
	rows, err := s.postgres.ListMachineConfigs(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rows})
}

func (s *Server) adminUpsertMachineConfigJSON(c *gin.Context) {
	var row models.MachineConfigRow
	if err := c.ShouldBindJSON(&row); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if row.ConnectionConfigJSON == "" {
		row.ConnectionConfigJSON = "{}"
	}
	if row.ProductionConfigJSON == "" {
		row.ProductionConfigJSON = "{}"
	}
	if row.MQTTTopicsJSON == "" {
		row.MQTTTopicsJSON = "{}"
	}
	if err := s.postgres.UpsertMachineConfig(c.Request.Context(), &row); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if s.collector != nil {
		_ = s.collector.RefreshMachineCacheFromPostgres()
	}
	if s.pollerManager != nil {
		_ = s.pollerManager.Reload()
	}
	c.JSON(http.StatusOK, gin.H{"message": "saved", "data": row})
}

func (s *Server) adminDeleteMachineConfigJSON(c *gin.Context) {
	id := c.Param("id")
	if err := s.postgres.DeleteMachineConfig(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if s.collector != nil {
		_ = s.collector.RefreshMachineCacheFromPostgres()
	}
	if s.pollerManager != nil {
		_ = s.pollerManager.Reload()
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (s *Server) adminTestConnectionJSON(c *gin.Context) {
	id := c.Param("id")
	row, err := s.postgres.GetMachineConfig(c.Request.Context(), id)
	if err != nil || row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := protocol.TestConnection(c.Request.Context(), row.Protocol, row.ConnectionConfigJSON); err != nil {
		c.JSON(http.StatusOK, gin.H{"ok": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
