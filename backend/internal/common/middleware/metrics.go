package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ton-empire/backend/internal/common/metrics"
)

// Metrics middleware for recording HTTP metrics
func Metrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// Calculate request duration
		duration := time.Since(start).Seconds()

		// Get request details
		method := c.Request.Method
		path := c.FullPath()
		if path == "" {
			path = "unknown"
		}
		status := strconv.Itoa(c.Writer.Status())

		// Record metrics
		metrics.RecordHTTPRequest(method, path, status, duration)
	}
}