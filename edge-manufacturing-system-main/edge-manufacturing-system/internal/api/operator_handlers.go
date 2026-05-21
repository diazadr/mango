package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourorg/cnc-edge/internal/models"
)

// POST /api/v1/operator/checkin
func (s *Server) operatorCheckin(c *gin.Context) {
	var req struct {
		MachineID   string `json:"machine_id" binding:"required"`
		OperatorID  string `json:"operator_id"`
		OperatorName string `json:"operator_name"`
		Department  string `json:"department"`
		Shift       int    `json:"shift" binding:"required"`
		WorkOrder   string `json:"work_order"`
		PartNumber  string `json:"part_number"`
		TargetQty   int    `json:"target_qty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	if req.OperatorID != "" && req.OperatorName != "" {
		_ = s.postgres.UpsertOperator(ctx, &models.Operator{
			ID:         req.OperatorID,
			Name:       req.OperatorName,
			Department: req.Department,
			DefaultShift: req.Shift,
		})
	}
	id, err := s.postgres.InsertOperatorCheckin(ctx, &models.OperatorCheckin{
		MachineID:  req.MachineID,
		OperatorID: req.OperatorID,
		Shift:      req.Shift,
		WorkOrder:  req.WorkOrder,
		PartNumber: req.PartNumber,
		TargetQty:  req.TargetQty,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "checked in", "checkin_id": id})
}

// GET /api/v1/operator/current/:machine_id
func (s *Server) operatorCurrent(c *gin.Context) {
	machineID := c.Param("machine_id")
	ch, err := s.postgres.GetCurrentCheckin(c.Request.Context(), machineID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ch == nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ch})
}

// POST /api/v1/operator/production-log — same payload as /api/v1/production/logs
func (s *Server) operatorProductionLog(c *gin.Context) {
	s.createProductionLog(c)
}

// POST /api/v1/operator/downtime
func (s *Server) operatorDowntime(c *gin.Context) {
	var req models.DowntimeLog
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.MachineID == "" || req.Category == "" || req.StartedAt.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "machine_id, category, started_at required"})
		return
	}
	id, err := s.postgres.InsertDowntimeLog(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.ID = id
	c.JSON(http.StatusCreated, gin.H{"message": "downtime stored", "data": req})
}

// PUT /api/v1/operator/downtime/:id/resolve
func (s *Server) operatorDowntimeResolve(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var body struct {
		ActionTaken string `json:"action_taken"`
	}
	_ = c.ShouldBindJSON(&body)
	if err := s.postgres.ResolveDowntimeLog(c.Request.Context(), id, body.ActionTaken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "downtime resolved", "id": id})
}

// GET /api/v1/operator/production/summary — proxy to same logic as production/summary
func (s *Server) operatorProductionSummary(c *gin.Context) {
	s.productionSummary(c)
}

// POST /api/v1/operator/checkout  (body: checkin_id or machine_id)
func (s *Server) operatorCheckout(c *gin.Context) {
	var req struct {
		CheckinID  int64  `json:"checkin_id"`
		MachineID  string `json:"machine_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	if req.CheckinID > 0 {
		if err := s.postgres.CheckoutOperator(ctx, req.CheckinID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "checked out"})
		return
	}
	if req.MachineID != "" {
		ch, err := s.postgres.GetCurrentCheckin(ctx, req.MachineID)
		if err != nil || ch == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "no active checkin"})
			return
		}
		if err := s.postgres.CheckoutOperator(ctx, ch.ID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "checked out", "checkin_id": ch.ID})
		return
	}
	c.JSON(http.StatusBadRequest, gin.H{"error": "checkin_id or machine_id required"})
}

// GET /api/v1/operator/list
func (s *Server) operatorList(c *gin.Context) {
	ops, err := s.postgres.ListOperators(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ops})
}
