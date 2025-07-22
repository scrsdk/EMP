package websocket

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ton-empire/backend/internal/common/middleware"
	"github.com/ton-empire/backend/pkg/logger"
)


// Handler handles WebSocket connections
type Handler struct {
	hub *Hub
}

// NewHandler creates a new WebSocket handler
func NewHandler(hub *Hub) *Handler {
	return &Handler{
		hub: hub,
	}
}

// HandleWebSocket handles WebSocket upgrade requests
func (h *Handler) HandleWebSocket(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Errorf("Failed to upgrade connection: %v", err)
		return
	}

	// Create new client
	client := NewClient(h.hub, conn, userID)

	// Register client with hub
	h.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in new goroutines
	go client.WritePump()
	go client.ReadPump()

	// Auto-join user to their district and guild rooms
	h.autoJoinRooms(client, userID)

	logger.Infof("WebSocket connection established for user %s", userID)
}

// autoJoinRooms automatically joins user to relevant rooms
func (h *Handler) autoJoinRooms(client *Client, userID uuid.UUID) {
	// Join personal room (for direct messages)
	h.hub.JoinRoom(client, "user:"+userID.String())

	// TODO: Query user's district and guild from database
	// For now, we'll use placeholder room IDs
	
	// Join district room
	// districtID := getUserDistrictID(userID)
	// if districtID != "" {
	//     h.hub.JoinRoom(client, "district:"+districtID)
	// }

	// Join guild room
	// guildID := getUserGuildID(userID)
	// if guildID != "" {
	//     h.hub.JoinRoom(client, "guild:"+guildID)
	// }
}

// NotifyResourceUpdate sends resource update notification to a user
func (h *Handler) NotifyResourceUpdate(userID uuid.UUID, resources map[string]int64) {
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypeResourceUpdate,
		UserID:    userID,
		Timestamp: time.Now(),
	}

	data, _ := json.Marshal(map[string]interface{}{
		"resources": resources,
	})
	msg.Data = data

	h.hub.broadcast <- msg
}

// NotifyBuildingUpdate sends building update notification
func (h *Handler) NotifyBuildingUpdate(userID uuid.UUID, building interface{}) {
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypeBuildingUpdate,
		UserID:    userID,
		Timestamp: time.Now(),
	}

	data, _ := json.Marshal(map[string]interface{}{
		"building": building,
	})
	msg.Data = data

	h.hub.broadcast <- msg
}

// NotifyGuildEvent sends guild event to all guild members
func (h *Handler) NotifyGuildEvent(guildID string, eventType string, eventData interface{}) {
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypeGuildUpdate,
		Timestamp: time.Now(),
	}

	data, _ := json.Marshal(map[string]interface{}{
		"room_id":    "guild:" + guildID,
		"event_type": eventType,
		"event_data": eventData,
	})
	msg.Data = data

	h.hub.broadcast <- msg
}

// SendNotification sends a notification to a specific user
func (h *Handler) SendNotification(userID uuid.UUID, title, message string, notificationType string) {
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypeNotification,
		UserID:    userID,
		Timestamp: time.Now(),
	}

	data, _ := json.Marshal(map[string]interface{}{
		"title":   title,
		"message": message,
		"type":    notificationType,
	})
	msg.Data = data

	h.hub.broadcast <- msg
}

// GetOnlineStats returns online statistics
func (h *Handler) GetOnlineStats() map[string]interface{} {
	return map[string]interface{}{
		"online_users": h.hub.GetOnlineUsers(),
		"total_connections": len(h.hub.clients),
		"active_rooms": len(h.hub.rooms),
	}
}