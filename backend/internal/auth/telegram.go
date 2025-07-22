package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

// TelegramAuthData represents Telegram Mini App init data
type TelegramAuthData struct {
	QueryID      string `json:"query_id"`
	User         *TelegramUser `json:"user"`
	AuthDate     int64  `json:"auth_date"`
	Hash         string `json:"hash"`
	StartParam   string `json:"start_param,omitempty"`
	CanSendAfter int    `json:"can_send_after,omitempty"`
	ChatType     string `json:"chat_type,omitempty"`
	ChatInstance string `json:"chat_instance,omitempty"`
}

type TelegramUser struct {
	ID              int64  `json:"id"`
	IsBot           bool   `json:"is_bot"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name,omitempty"`
	Username        string `json:"username,omitempty"`
	LanguageCode    string `json:"language_code,omitempty"`
	IsPremium       bool   `json:"is_premium,omitempty"`
	AllowsWriteToPM bool   `json:"allows_write_to_pm,omitempty"`
	PhotoURL        string `json:"photo_url,omitempty"`
}

// ValidateTelegramAuth validates Telegram Mini App init data
func ValidateTelegramAuth(initData string, botToken string) (*TelegramAuthData, error) {
	// Parse URL-encoded data
	values, err := url.ParseQuery(initData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse init data: %w", err)
	}

	// Extract hash
	hash := values.Get("hash")
	if hash == "" {
		return nil, fmt.Errorf("hash is missing from init data")
	}

	// Remove hash from values for verification
	values.Del("hash")

	// Create data-check-string
	var keys []string
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var dataCheckString []string
	for _, k := range keys {
		dataCheckString = append(dataCheckString, fmt.Sprintf("%s=%s", k, values.Get(k)))
	}
	dataCheckStr := strings.Join(dataCheckString, "\n")

	// Verify hash
	if !verifyTelegramHash(dataCheckStr, hash, botToken) {
		return nil, fmt.Errorf("invalid hash")
	}

	// Parse auth data
	authData := &TelegramAuthData{
		QueryID:      values.Get("query_id"),
		Hash:         hash,
		StartParam:   values.Get("start_param"),
		ChatType:     values.Get("chat_type"),
		ChatInstance: values.Get("chat_instance"),
	}

	// Parse auth date
	if authDateStr := values.Get("auth_date"); authDateStr != "" {
		authDate, err := strconv.ParseInt(authDateStr, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid auth_date: %w", err)
		}
		authData.AuthDate = authDate

		// Check if auth data is not too old (5 minutes)
		if time.Now().Unix()-authDate > 300 {
			return nil, fmt.Errorf("auth data is too old")
		}
	}

	// Parse user data
	if userStr := values.Get("user"); userStr != "" {
		var user TelegramUser
		if err := json.Unmarshal([]byte(userStr), &user); err != nil {
			return nil, fmt.Errorf("failed to parse user data: %w", err)
		}
		authData.User = &user
	}

	// Parse can_send_after
	if canSendAfterStr := values.Get("can_send_after"); canSendAfterStr != "" {
		canSendAfter, err := strconv.Atoi(canSendAfterStr)
		if err != nil {
			return nil, fmt.Errorf("invalid can_send_after: %w", err)
		}
		authData.CanSendAfter = canSendAfter
	}

	return authData, nil
}

func verifyTelegramHash(dataCheckString, hash, botToken string) bool {
	// Create secret key using bot token
	secretKey := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	
	// Calculate hash
	calculatedHash := hmacSHA256([]byte(dataCheckString), secretKey)
	calculatedHashHex := hex.EncodeToString(calculatedHash)

	// Compare hashes
	return calculatedHashHex == hash
}

func hmacSHA256(data, key []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}