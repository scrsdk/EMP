package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/internal/common/middleware"
	"github.com/ton-empire/backend/internal/common/proxy"
	"github.com/ton-empire/backend/internal/websocket"
	"github.com/ton-empire/backend/pkg/logger"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("Failed to load config: %v", err)
	}

	if err := logger.Init(cfg.Logging.Level, cfg.Logging.Format); err != nil {
		logger.Fatalf("Failed to initialize logger: %v", err)
	}

	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	wsHub := websocket.NewHub()
	go wsHub.Run()

	wsHandler := websocket.NewHandler(wsHub)

	serviceProxy := proxy.NewServiceProxy(cfg)

	router := setupRouter(cfg, serviceProxy, wsHandler)

	srv := &http.Server{
		Addr:         cfg.Server.APIGateway.Address(),
		Handler:      router,
		ReadTimeout:  cfg.Server.APIGateway.ReadTimeout,
		WriteTimeout: cfg.Server.APIGateway.WriteTimeout,
	}

	go func() {
		logger.Infof("Starting API Gateway on %s", srv.Addr)
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

func setupRouter(cfg *config.Config, serviceProxy *proxy.ServiceProxy, wsHandler *websocket.Handler) *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.RequestID())
	router.Use(middleware.Metrics())
	
	if cfg.Server.APIGateway.CORS != nil {
		router.Use(middleware.CORS(cfg.Server.APIGateway.CORS))
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"service": "api-gateway",
			"timestamp": time.Now().Unix(),
		})
	})

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.GET("/ws", middleware.Auth(), wsHandler.HandleWebSocket)

	router.GET("/ws/stats", func(c *gin.Context) {
		c.JSON(http.StatusOK, wsHandler.GetOnlineStats())
	})

	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/telegram", func(c *gin.Context) {
				serviceProxy.ProxyToAuth(c, "/auth/telegram")
			})
			auth.POST("/refresh", func(c *gin.Context) {
				serviceProxy.ProxyToAuth(c, "/auth/refresh")
			})
			auth.POST("/logout", middleware.Auth(), func(c *gin.Context) {
				serviceProxy.ProxyToAuth(c, "/auth/logout")
			})
		}

		users := v1.Group("/users")
		users.Use(middleware.Auth())
		{
			users.GET("/me", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/me")
			})
			users.PUT("/me", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/me")
			})
			users.GET("/me/stats", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/me/stats")
			})
			users.POST("/me/wallet", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/me/wallet")
			})
			users.GET("/:id", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/"+c.Param("id"))
			})
			users.GET("/username/:username", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/username/"+c.Param("username"))
			})
			users.GET("/search", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/search?"+c.Request.URL.RawQuery)
			})
			users.GET("/leaderboard", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/leaderboard?"+c.Request.URL.RawQuery)
			})
			users.GET("/guild/members", func(c *gin.Context) {
				serviceProxy.ProxyToUser(c, "/users/guild/members")
			})
		}

		game := v1.Group("/game")
		game.Use(middleware.Auth())
		{
			districts := game.Group("/districts")
			{
				districts.GET("/mine", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/districts/mine")
				})
				districts.GET("/:id/buildings", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/districts/"+c.Param("id")+"/buildings")
				})
				districts.POST("/buildings", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/districts/buildings")
				})
				districts.PUT("/buildings/:id/upgrade", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/districts/buildings/"+c.Param("id")+"/upgrade")
				})
				districts.POST("/collect", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/districts/collect")
				})
			}

			guilds := game.Group("/guilds")
			{
				guilds.GET("", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/guilds")
				})
				guilds.POST("", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/guilds")
				})
				guilds.GET("/:id", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/guilds/"+c.Param("id"))
				})
				guilds.POST("/:id/join", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/guilds/"+c.Param("id")+"/join")
				})
				guilds.POST("/leave", func(c *gin.Context) {
					serviceProxy.ProxyToGame(c, "/guilds/leave")
				})
			}
		}
	}

	return router
}

