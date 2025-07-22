package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Telegram TelegramConfig `mapstructure:"telegram"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	RateLimiter RateLimiterConfig `mapstructure:"rate_limiter"`
	Logging  LoggingConfig  `mapstructure:"logging"`
}

type AppConfig struct {
	Name  string `mapstructure:"name"`
	Env   string `mapstructure:"env"`
	Debug bool   `mapstructure:"debug"`
}

type ServerConfig struct {
	APIGateway  ServiceConfig `mapstructure:"api_gateway"`
	AuthService ServiceConfig `mapstructure:"auth_service"`
	UserService ServiceConfig `mapstructure:"user_service"`
	GameService ServiceConfig `mapstructure:"game_service"`
}

type ServiceConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	CORS         *CORSConfig   `mapstructure:"cors,omitempty"`
}

type CORSConfig struct {
	AllowedOrigins []string `mapstructure:"allowed_origins"`
	AllowedMethods []string `mapstructure:"allowed_methods"`
	AllowedHeaders []string `mapstructure:"allowed_headers"`
}

type DatabaseConfig struct {
	Postgres PostgresConfig `mapstructure:"postgres"`
}

type PostgresConfig struct {
	Host                  string        `mapstructure:"host"`
	Port                  int           `mapstructure:"port"`
	User                  string        `mapstructure:"user"`
	Password              string        `mapstructure:"password"`
	Database              string        `mapstructure:"database"`
	SSLMode               string        `mapstructure:"ssl_mode"`
	MaxConnections        int           `mapstructure:"max_connections"`
	MaxIdleConnections    int           `mapstructure:"max_idle_connections"`
	ConnectionMaxLifetime time.Duration `mapstructure:"connection_max_lifetime"`
}

type RedisConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	Password     string        `mapstructure:"password"`
	DB           int           `mapstructure:"db"`
	PoolSize     int           `mapstructure:"pool_size"`
	MinIdleConns int           `mapstructure:"min_idle_conns"`
	MaxRetries   int           `mapstructure:"max_retries"`
	CacheTTL     time.Duration `mapstructure:"cache_ttl"`
}

type TelegramConfig struct {
	BotToken   string `mapstructure:"bot_token"`
	WebAppURL  string `mapstructure:"webapp_url"`
}

type JWTConfig struct {
	Secret           string        `mapstructure:"secret"`
	AccessTokenTTL   time.Duration `mapstructure:"access_token_ttl"`
	RefreshTokenTTL  time.Duration `mapstructure:"refresh_token_ttl"`
}

type RateLimiterConfig struct {
	RequestsPerMinute int `mapstructure:"requests_per_minute"`
	Burst             int `mapstructure:"burst"`
}

type LoggingConfig struct {
	Level  string         `mapstructure:"level"`
	Format string         `mapstructure:"format"`
	Output []string       `mapstructure:"output"`
	File   FileLogConfig  `mapstructure:"file"`
}

type FileLogConfig struct {
	Path       string `mapstructure:"path"`
	MaxSize    int    `mapstructure:"max_size"`
	MaxBackups int    `mapstructure:"max_backups"`
	MaxAge     int    `mapstructure:"max_age"`
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../config")
	viper.AddConfigPath("../../config")

	viper.AutomaticEnv()
	viper.SetEnvPrefix("TON_EMPIRE")

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

func (s ServiceConfig) Address() string {
	return fmt.Sprintf("%s:%d", s.Host, s.Port)
}

func (p PostgresConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		p.Host, p.Port, p.User, p.Password, p.Database, p.SSLMode)
}