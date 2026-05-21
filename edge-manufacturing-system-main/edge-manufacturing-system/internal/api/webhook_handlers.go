package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourorg/cnc-edge/internal/logger"
	"go.uber.org/zap"
)

// POST /api/v1/webhooks/mango — optional push dari MANGO (validasi shared secret).
func (s *Server) webhookMango(c *gin.Context) {
	if s.cfg == nil || s.cfg.Mango.WebhookSecret == "" {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "webhook not configured"})
		return
	}
	secret := c.GetHeader("X-Webhook-Secret")
	if secret == "" {
		secret = c.Query("secret")
	}
	if secret != s.cfg.Mango.WebhookSecret {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid secret"})
		return
	}

	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Webhook MANGO diterima", zap.Any("keys", keysOf(payload)))
	c.JSON(http.StatusOK, gin.H{"received": true})
}

func keysOf(m map[string]interface{}) []string {
	k := make([]string, 0, len(m))
	for x := range m {
		k = append(k, x)
	}
	return k
}
