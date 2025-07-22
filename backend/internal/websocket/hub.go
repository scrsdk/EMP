package websocket

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/ton-empire/backend/pkg/logger"
)

// MessageType defines the type of WebSocket message
type MessageType string

const (
	// System messages
	MessageTypeConnect    MessageType = "connect"
	MessageTypeDisconnect MessageType = "disconnect"
	MessageTypePing       MessageType = "ping"
	MessageTypePong       MessageType = "pong"
	
	// Game events
	MessageTypeResourceUpdate   MessageType = "resource_update"
	MessageTypeBuildingUpdate   MessageType = "building_update"
	MessageTypeDistrictUpdate   MessageType = "district_update"
	MessageTypeGuildUpdate      MessageType = "guild_update"
	MessageTypeBattleEvent      MessageType = "battle_event"
	MessageTypeNotification     MessageType = "notification"
	
	// Chat messages
	MessageTypeChatGuild    MessageType = "chat_guild"
	MessageTypeChatDistrict MessageType = "chat_district"
	MessageTypeChatPrivate  MessageType = "chat_private"
)

// Message represents a WebSocket message
type Message struct {
	ID        string          `json:"id"`
	Type      MessageType     `json:"type"`
	UserID    uuid.UUID       `json:"user_id,omitempty"`
	Timestamp time.Time       `json:"timestamp"`
	Data      json.RawMessage `json:"data"`
}

// Client represents a WebSocket client connection
type Client struct {
	ID       uuid.UUID
	UserID   uuid.UUID
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
	Rooms    map[string]bool
	mu       sync.RWMutex
}

// Room represents a group of clients (e.g., guild, district)
type Room struct {
	ID      string
	Clients map[*Client]bool
	mu      sync.RWMutex
}

// Hub maintains active client connections and broadcasts messages
type Hub struct {
	// Registered clients
	clients map[uuid.UUID]*Client
	
	// Rooms for group messaging
	rooms map[string]*Room
	
	// Inbound messages from clients
	broadcast chan *Message
	
	// Register requests from clients
	register chan *Client
	
	// Unregister requests from clients
	unregister chan *Client
	
	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uuid.UUID]*Client),
		rooms:      make(map[string]*Room),
		broadcast:  make(chan *Message, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub's event loop
func (h *Hub) Run() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.handleMessage(message)

		case <-ticker.C:
			h.pingClients()
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client.ID] = client
	logger.Infof("Client registered: %s (User: %s)", client.ID, client.UserID)

	// Send connection confirmation
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypeConnect,
		Timestamp: time.Now(),
		Data:      json.RawMessage(`{"status":"connected"}`),
	}
	
	if data, err := json.Marshal(msg); err == nil {
		select {
		case client.Send <- data:
		default:
			// Client's send channel is full
		}
	}
}

func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[client.ID]; ok {
		// Remove from all rooms
		for roomID := range client.Rooms {
			h.removeFromRoom(client, roomID)
		}

		delete(h.clients, client.ID)
		close(client.Send)
		logger.Infof("Client unregistered: %s (User: %s)", client.ID, client.UserID)
	}
}

func (h *Hub) handleMessage(message *Message) {
	switch message.Type {
	case MessageTypeChatGuild, MessageTypeChatDistrict:
		// Broadcast to room
		h.broadcastToRoom(message)
	case MessageTypeResourceUpdate, MessageTypeBuildingUpdate, MessageTypeDistrictUpdate:
		// Send to specific user
		h.sendToUser(message.UserID, message)
	default:
		// Broadcast to all clients (for now)
		h.broadcastToAll(message)
	}
}

func (h *Hub) broadcastToAll(message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		logger.Errorf("Failed to marshal message: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		select {
		case client.Send <- data:
		default:
			// Client's send channel is full, skip
		}
	}
}

func (h *Hub) broadcastToRoom(message *Message) {
	// Extract room ID from message data
	var msgData struct {
		RoomID string `json:"room_id"`
	}
	
	if err := json.Unmarshal(message.Data, &msgData); err != nil {
		logger.Errorf("Failed to unmarshal room message: %v", err)
		return
	}

	h.mu.RLock()
	room, exists := h.rooms[msgData.RoomID]
	h.mu.RUnlock()

	if !exists {
		return
	}

	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	room.mu.RLock()
	defer room.mu.RUnlock()

	for client := range room.Clients {
		select {
		case client.Send <- data:
		default:
			// Skip if channel is full
		}
	}
}

func (h *Hub) sendToUser(userID uuid.UUID, message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- data:
			default:
				// Skip if channel is full
			}
		}
	}
}

func (h *Hub) pingClients() {
	msg := &Message{
		ID:        uuid.New().String(),
		Type:      MessageTypePing,
		Timestamp: time.Now(),
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		select {
		case client.Send <- data:
		default:
			// Skip if channel is full
		}
	}
}

// JoinRoom adds a client to a room
func (h *Hub) JoinRoom(client *Client, roomID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	room, exists := h.rooms[roomID]
	if !exists {
		room = &Room{
			ID:      roomID,
			Clients: make(map[*Client]bool),
		}
		h.rooms[roomID] = room
	}

	room.mu.Lock()
	room.Clients[client] = true
	room.mu.Unlock()

	client.mu.Lock()
	client.Rooms[roomID] = true
	client.mu.Unlock()

	logger.Infof("Client %s joined room %s", client.ID, roomID)
}

// LeaveRoom removes a client from a room
func (h *Hub) LeaveRoom(client *Client, roomID string) {
	h.removeFromRoom(client, roomID)
}

func (h *Hub) removeFromRoom(client *Client, roomID string) {
	room, exists := h.rooms[roomID]
	if !exists {
		return
	}

	room.mu.Lock()
	delete(room.Clients, client)
	room.mu.Unlock()

	client.mu.Lock()
	delete(client.Rooms, roomID)
	client.mu.Unlock()

	// Delete room if empty
	if len(room.Clients) == 0 {
		delete(h.rooms, roomID)
	}
}

// GetClientsInRoom returns all clients in a specific room
func (h *Hub) GetClientsInRoom(roomID string) []*Client {
	h.mu.RLock()
	room, exists := h.rooms[roomID]
	h.mu.RUnlock()

	if !exists {
		return nil
	}

	room.mu.RLock()
	defer room.mu.RUnlock()

	clients := make([]*Client, 0, len(room.Clients))
	for client := range room.Clients {
		clients = append(clients, client)
	}

	return clients
}

// GetOnlineUsers returns count of online users
func (h *Hub) GetOnlineUsers() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	uniqueUsers := make(map[uuid.UUID]bool)
	for _, client := range h.clients {
		uniqueUsers[client.UserID] = true
	}
	
	return len(uniqueUsers)
}