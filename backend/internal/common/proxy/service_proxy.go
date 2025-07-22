package proxy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/pkg/logger"
)

type ServiceProxy struct {
	httpClient *http.Client
	config     *config.Config
}

func NewServiceProxy(cfg *config.Config) *ServiceProxy {
	return &ServiceProxy{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		config: cfg,
	}
}

// ProxyToAuth forwards request to auth service
func (s *ServiceProxy) ProxyToAuth(c *gin.Context, path string) {
	targetURL := fmt.Sprintf("http://%s%s", s.config.Server.AuthService.Address(), path)
	s.proxyRequest(c, targetURL)
}

// ProxyToUser forwards request to user service
func (s *ServiceProxy) ProxyToUser(c *gin.Context, path string) {
	targetURL := fmt.Sprintf("http://%s%s", s.config.Server.UserService.Address(), path)
	s.proxyRequest(c, targetURL)
}

// ProxyToGame forwards request to game service
func (s *ServiceProxy) ProxyToGame(c *gin.Context, path string) {
	targetURL := fmt.Sprintf("http://%s%s", s.config.Server.GameService.Address(), path)
	s.proxyRequest(c, targetURL)
}

func (s *ServiceProxy) proxyRequest(c *gin.Context, targetURL string) {
	// Read request body
	var bodyBytes []byte
	if c.Request.Body != nil {
		bodyBytes, _ = io.ReadAll(c.Request.Body)
	}

	// Create new request
	req, err := http.NewRequest(c.Request.Method, targetURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		logger.Errorf("Failed to create proxy request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	// Copy headers
	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Add request ID
	if requestID := c.GetHeader("X-Request-ID"); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}

	// Add user ID from context if authenticated
	if userID, exists := c.Get("user_id"); exists {
		req.Header.Set("X-User-ID", fmt.Sprintf("%v", userID))
	}

	// Send request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		logger.Errorf("Failed to proxy request to %s: %v", targetURL, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "service unavailable"})
		return
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Errorf("Failed to read proxy response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}

	// Write response
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// CallService makes a direct service-to-service call
func (s *ServiceProxy) CallService(serviceAddr string, method string, path string, body interface{}, response interface{}) error {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	url := fmt.Sprintf("http://%s%s", serviceAddr, path)
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("service returned error: %d - %s", resp.StatusCode, string(body))
	}

	if response != nil {
		if err := json.NewDecoder(resp.Body).Decode(response); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}
	}

	return nil
}