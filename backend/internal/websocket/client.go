package websocket

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/ton-empire/backend/pkg/logger"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512 * 1024 // 512KB
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: Implement proper origin checking
		return true
	},
}

// NewClient creates a new WebSocket client
func NewClient(hub *Hub, conn *websocket.Conn, userID uuid.UUID) *Client {
	return &Client{
		ID:     uuid.New(),
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    hub,
		Rooms:  make(map[string]bool),
	}
}

// ReadPump pumps messages from the websocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		var message Message
		err := c.Conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Errorf("WebSocket error: %v", err)
			}
			break
		}

		// Set message metadata
		message.ID = uuid.New().String()
		message.UserID = c.UserID
		message.Timestamp = time.Now()

		// Handle different message types
		switch message.Type {
		case MessageTypePong:
			// Pong received, connection is alive
			continue

		case MessageTypeChatGuild, MessageTypeChatDistrict:
			// Validate user has access to the room
			var msgData struct {
				RoomID string `json:"room_id"`
			}
			if err := json.Unmarshal(message.Data, &msgData); err != nil {
				c.sendError("Invalid message format")
				continue
			}
			
			c.mu.RLock()
			hasAccess := c.Rooms[msgData.RoomID]
			c.mu.RUnlock()
			
			if !hasAccess {
				c.sendError("No access to this room")
				continue
			}

		case MessageTypeNotification:
			// Notifications are server->client only
			c.sendError("Cannot send notifications")
			continue
		}

		// Send message to hub for processing
		c.Hub.broadcast <- &message
	}
}

// WritePump pumps messages from the hub to the websocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// SendMessage sends a message to the client
func (c *Client) SendMessage(messageType MessageType, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	msg := &Message{
		ID:        uuid.New().String(),
		Type:      messageType,
		Timestamp: time.Now(),
		Data:      jsonData,
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	select {
	case c.Send <- msgBytes:
		return nil
	default:
		return err
	}
}

// sendError sends an error message to the client
func (c *Client) sendError(errorMsg string) {
	errorData := map[string]string{
		"error": errorMsg,
	}
	
	jsonData, _ := json.Marshal(errorData)
	
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      "error",
		Timestamp: time.Now(),
		Data:      jsonData,
	}

	if msgBytes, err := json.Marshal(msg); err == nil {
		select {
		case c.Send <- msgBytes:
		default:
			// Channel full, skip
		}
	}
}