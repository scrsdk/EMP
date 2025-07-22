package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ton-empire/backend/pkg/logger"
)

func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Custom log format
		logger.Infof("%s | %d | %13v | %15s | %-7s %#v",
			param.TimeStamp.Format(time.RFC3339),
			param.StatusCode,
			param.Latency,
			param.ClientIP,
			param.Method,
			param.Path,
		)

		return ""
	})
}