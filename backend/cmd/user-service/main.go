package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/internal/common/database"
	"github.com/ton-empire/backend/internal/common/middleware"
	"github.com/ton-empire/backend/internal/user"
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

	// Create user repository and service
	userRepo := user.NewRepository(db)
	userService := user.NewService(userRepo)

	// Set Gin mode
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := setupRouter(cfg, userService)

	// Create HTTP server
	srv := &http.Server{
		Addr:         cfg.Server.UserService.Address(),
		Handler:      router,
		ReadTimeout:  cfg.Server.UserService.ReadTimeout,
		WriteTimeout: cfg.Server.UserService.WriteTimeout,
	}

	// Start server in goroutine
	go func() {
		logger.Infof("Starting User Service on %s", srv.Addr)
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

func setupRouter(cfg *config.Config, userService *user.Service) *gin.Engine {
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.RequestID())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "user-service",
			"timestamp": time.Now().Unix(),
		})
	})

	// User routes - all require authentication
	router.Use(middleware.Auth())
	
	// Current user endpoints
	router.GET("/users/me", handleGetCurrentUser(userService))
	router.PUT("/users/me", handleUpdateCurrentUser(userService))
	router.GET("/users/me/stats", handleGetCurrentUserStats(userService))
	router.POST("/users/me/wallet", handleConnectWallet(userService))
	
	// Other user endpoints
	router.GET("/users/:id", handleGetUser(userService))
	router.GET("/users/username/:username", handleGetUserByUsername(userService))
	
	// Social endpoints
	router.GET("/users/search", handleSearchUsers(userService))
	router.GET("/users/leaderboard", handleGetLeaderboard(userService))
	router.GET("/users/guild/members", handleGetGuildMembers(userService))
	
	// Experience endpoint (internal use)
	router.POST("/users/:id/experience", handleAddExperience(userService))

	return router
}

// Request types
type ConnectWalletRequest struct {
	WalletAddress string `json:"wallet_address" binding:"required"`
}

type AddExperienceRequest struct {
	Amount int64 `json:"amount" binding:"required,min=1"`
}

// Handlers
func handleGetCurrentUser(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		user, err := service.GetUser(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to get user: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func handleUpdateCurrentUser(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req user.UpdateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		updatedUser, err := service.UpdateUser(c.Request.Context(), userID, req)
		if err != nil {
			logger.Errorf("Failed to update user: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, updatedUser)
	}
}

func handleGetCurrentUserStats(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		stats, err := service.GetUserStats(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to get user stats: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stats"})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

func handleConnectWallet(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req ConnectWalletRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		if err := service.ConnectWallet(c.Request.Context(), userID, req.WalletAddress); err != nil {
			logger.Errorf("Failed to connect wallet: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "wallet connected successfully"})
	}
}

func handleGetUser(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr := c.Param("id")
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
			return
		}

		user, err := service.GetUser(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to get user: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func handleGetUserByUsername(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		user, err := service.GetUserByUsername(c.Request.Context(), username)
		if err != nil {
			logger.Errorf("Failed to get user by username: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func handleSearchUsers(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "search query required"})
			return
		}

		limit := 20
		if l := c.Query("limit"); l != "" {
			if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
				limit = parsed
			}
		}

		users, err := service.SearchUsers(c.Request.Context(), query, limit)
		if err != nil {
			logger.Errorf("Failed to search users: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"users": users,
			"count": len(users),
		})
	}
}

func handleGetLeaderboard(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		limit := 50
		if l := c.Query("limit"); l != "" {
			if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
				limit = parsed
			}
		}

		entries, err := service.GetLeaderboard(c.Request.Context(), limit)
		if err != nil {
			logger.Errorf("Failed to get leaderboard: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get leaderboard"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"leaderboard": entries,
			"count":       len(entries),
		})
	}
}

func handleGetGuildMembers(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		members, err := service.GetGuildMembers(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to get guild members: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"members": members,
			"count":   len(members),
		})
	}
}

func handleAddExperience(service *user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// This endpoint should be restricted to internal services only
		// In production, add proper service-to-service authentication
		
		userIDStr := c.Param("id")
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
			return
		}

		var req AddExperienceRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		result, err := service.AddExperience(c.Request.Context(), userID, req.Amount)
		if err != nil {
			logger.Errorf("Failed to add experience: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}