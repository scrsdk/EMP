package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/pkg/logger"
)

type RedisCache struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisCache(cfg config.RedisConfig) (*RedisCache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		MinIdleConns: cfg.MinIdleConns,
		MaxRetries:   cfg.MaxRetries,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Successfully connected to Redis")

	return &RedisCache{
		client: client,
		ttl:    cfg.CacheTTL,
	}, nil
}

func (c *RedisCache) Close() error {
	return c.client.Close()
}

// Get retrieves a value from cache
func (c *RedisCache) Get(ctx context.Context, key string) (string, error) {
	val, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil // Key doesn't exist
	}
	return val, err
}

// Set stores a value in cache with default TTL
func (c *RedisCache) Set(ctx context.Context, key string, value interface{}) error {
	return c.SetWithTTL(ctx, key, value, c.ttl)
}

// SetWithTTL stores a value in cache with custom TTL
func (c *RedisCache) SetWithTTL(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	var data string
	switch v := value.(type) {
	case string:
		data = v
	case []byte:
		data = string(v)
	default:
		jsonData, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("failed to marshal value: %w", err)
		}
		data = string(jsonData)
	}

	return c.client.Set(ctx, key, data, ttl).Err()
}

// Delete removes a key from cache
func (c *RedisCache) Delete(ctx context.Context, key string) error {
	return c.client.Del(ctx, key).Err()
}

// Exists checks if a key exists in cache
func (c *RedisCache) Exists(ctx context.Context, key string) (bool, error) {
	n, err := c.client.Exists(ctx, key).Result()
	return n > 0, err
}

// GetJSON retrieves and unmarshals a JSON value from cache
func (c *RedisCache) GetJSON(ctx context.Context, key string, dest interface{}) error {
	val, err := c.Get(ctx, key)
	if err != nil {
		return err
	}
	if val == "" {
		return fmt.Errorf("key not found")
	}

	return json.Unmarshal([]byte(val), dest)
}

// SetJSON marshals and stores a JSON value in cache
func (c *RedisCache) SetJSON(ctx context.Context, key string, value interface{}) error {
	return c.Set(ctx, key, value)
}

// Increment increments a numeric value
func (c *RedisCache) Increment(ctx context.Context, key string) (int64, error) {
	return c.client.Incr(ctx, key).Result()
}

// IncrementBy increments a numeric value by a specific amount
func (c *RedisCache) IncrementBy(ctx context.Context, key string, value int64) (int64, error) {
	return c.client.IncrBy(ctx, key, value).Result()
}

// Expire sets a new expiration time for a key
func (c *RedisCache) Expire(ctx context.Context, key string, ttl time.Duration) error {
	return c.client.Expire(ctx, key, ttl).Err()
}

// TTL gets the remaining time to live for a key
func (c *RedisCache) TTL(ctx context.Context, key string) (time.Duration, error) {
	return c.client.TTL(ctx, key).Result()
}

// Lock implements a simple distributed lock
func (c *RedisCache) Lock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	return c.client.SetNX(ctx, key, "locked", ttl).Result()
}

// Unlock releases a lock
func (c *RedisCache) Unlock(ctx context.Context, key string) error {
	return c.client.Del(ctx, key).Err()
}

// Cache key builders
func UserCacheKey(userID string) string {
	return fmt.Sprintf("user:%s", userID)
}

func DistrictCacheKey(districtID string) string {
	return fmt.Sprintf("district:%s", districtID)
}

func BuildingsCacheKey(districtID string) string {
	return fmt.Sprintf("buildings:district:%s", districtID)
}

func SessionCacheKey(sessionID string) string {
	return fmt.Sprintf("session:%s", sessionID)
}

func LeaderboardCacheKey() string {
	return "leaderboard:global"
}

func ResourceCollectionKey(userID string) string {
	return fmt.Sprintf("collection:lock:%s", userID)
}