package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ton-empire/backend/internal/auth"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/internal/common/database"
	"github.com/ton-empire/backend/internal/common/middleware"
	"github.com/ton-empire/backend/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("Failed to load config: %v", err)
	}

	// Initialize logger
	if err := logger.Init(cfg.Logging.Level, cfg.Logging.Format); err != nil {
		logger.Fatalf("Failed to initialize logger: %v", err)
	}

	// Connect to database
	db, err := database.NewPostgresDB(cfg.Database.Postgres)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create auth service
	authService := auth.NewService(db, cfg)

	// Set Gin mode
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := setupRouter(cfg, authService)

	// Create HTTP server
	srv := &http.Server{
		Addr:         cfg.Server.AuthService.Address(),
		Handler:      router,
		ReadTimeout:  cfg.Server.AuthService.ReadTimeout,
		WriteTimeout: cfg.Server.AuthService.WriteTimeout,
	}

	// Start server in goroutine
	go func() {
		logger.Infof("Starting Auth Service on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Errorf("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exited")
}

func setupRouter(cfg *config.Config, authService *auth.Service) *gin.Engine {
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.RequestID())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"service": "auth-service",
			"timestamp": time.Now().Unix(),
		})
	})

	// Auth routes
	router.POST("/auth/telegram", handleTelegramAuth(authService))
	router.POST("/auth/refresh", handleRefreshToken(authService))
	router.POST("/auth/logout", middleware.Auth(), handleLogout(authService))

	return router
}

// Request/Response types
type TelegramAuthRequest struct {
	InitData string `json:"init_data" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Handlers
func handleTelegramAuth(service *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req TelegramAuthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		// Get user agent and IP for session
		ctx := c.Request.Context()
		
		authResp, err := service.AuthenticateWithTelegram(ctx, req.InitData)
		if err != nil {
			logger.Errorf("Telegram auth failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication failed"})
			return
		}

		c.JSON(http.StatusOK, authResp)
	}
}

func handleRefreshToken(service *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RefreshTokenRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		ctx := c.Request.Context()
		
		authResp, err := service.RefreshToken(ctx, req.RefreshToken)
		if err != nil {
			logger.Errorf("Refresh token failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
			return
		}

		c.JSON(http.StatusOK, authResp)
	}
}

func handleLogout(service *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RefreshTokenRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		ctx := c.Request.Context()
		
		if err := service.Logout(ctx, userID, req.RefreshToken); err != nil {
			logger.Errorf("Logout failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "logout failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
	}
}