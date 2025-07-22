package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/internal/common/database"
	"github.com/ton-empire/backend/internal/common/middleware"
	"github.com/ton-empire/backend/internal/game"
	"github.com/ton-empire/backend/pkg/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("Failed to load config: %v", err)
	}

	if err := logger.Init(cfg.Logging.Level, cfg.Logging.Format); err != nil {
		logger.Fatalf("Failed to initialize logger: %v", err)
	}

	db, err := database.NewPostgresDB(cfg.Database.Postgres)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	gameRepo := game.NewRepository(db)
	gameService := game.NewService(gameRepo)

	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := setupRouter(cfg, gameService)

	srv := &http.Server{
		Addr:         cfg.Server.GameService.Address(),
		Handler:      router,
		ReadTimeout:  cfg.Server.GameService.ReadTimeout,
		WriteTimeout: cfg.Server.GameService.WriteTimeout,
	}

	go func() {
		logger.Infof("Starting Game Service on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Errorf("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exited")
}

func setupRouter(cfg *config.Config, gameService *game.Service) *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.RequestID())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "game-service",
			"timestamp": time.Now().Unix(),
		})
	})

	router.Use(middleware.Auth())

	router.GET("/districts/mine", handleGetMyDistrict(gameService))
	router.GET("/districts/:id/buildings", handleGetDistrictBuildings(gameService))
	router.POST("/districts/buildings", handleCreateBuilding(gameService))
	router.PUT("/districts/buildings/:id/upgrade", handleUpgradeBuilding(gameService))
	router.POST("/districts/collect", handleCollectResources(gameService))

	router.GET("/guilds", handleGetGuilds(gameService))
	router.POST("/guilds", handleCreateGuild(gameService))
	router.GET("/guilds/:id", handleGetGuild(gameService))
	router.POST("/guilds/:id/join", handleJoinGuild(gameService))
	router.POST("/guilds/leave", handleLeaveGuild(gameService))

	return router
}

func handleGetMyDistrict(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		district, err := service.GetUserDistrict(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to get district: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get district"})
			return
		}

		c.JSON(http.StatusOK, district)
	}
}

func handleGetDistrictBuildings(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		districtIDStr := c.Param("id")
		districtID, err := uuid.Parse(districtIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid district ID"})
			return
		}


		buildings, err := service.GetDistrictBuildings(c.Request.Context(), districtID)
		if err != nil {
			logger.Errorf("Failed to get buildings: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get buildings"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"buildings": buildings,
			"count":     len(buildings),
		})
	}
}

func handleCreateBuilding(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req game.CreateBuildingRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		building, err := service.CreateBuilding(c.Request.Context(), userID, req)
		if err != nil {
			logger.Errorf("Failed to create building: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, building)
	}
}

func handleUpgradeBuilding(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		buildingIDStr := c.Param("id")
		buildingID, err := uuid.Parse(buildingIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid building ID"})
			return
		}

		building, err := service.UpgradeBuilding(c.Request.Context(), userID, buildingID)
		if err != nil {
			logger.Errorf("Failed to upgrade building: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, building)
	}
}

func handleCollectResources(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		result, err := service.CollectResources(c.Request.Context(), userID)
		if err != nil {
			logger.Errorf("Failed to collect resources: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to collect resources"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func handleGetGuilds(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"guilds": []interface{}{},
			"count":  0,
		})
	}
}

func handleCreateGuild(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req game.CreateGuildRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		guild, err := service.CreateGuild(c.Request.Context(), userID, req)
		if err != nil {
			logger.Errorf("Failed to create guild: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, guild)
	}
}

func handleGetGuild(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		guildIDStr := c.Param("id")
		guildID, err := uuid.Parse(guildIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid guild ID"})
			return
		}

		_ = guildID
		c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
	}
}

func handleJoinGuild(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		guildIDStr := c.Param("id")
		guildID, err := uuid.Parse(guildIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid guild ID"})
			return
		}

		if err := service.JoinGuild(c.Request.Context(), userID, guildID); err != nil {
			logger.Errorf("Failed to join guild: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "successfully joined guild"})
	}
}

func handleLeaveGuild(service *game.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := middleware.GetUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		if err := service.LeaveGuild(c.Request.Context(), userID); err != nil {
			logger.Errorf("Failed to leave guild: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "successfully left guild"})
	}
}