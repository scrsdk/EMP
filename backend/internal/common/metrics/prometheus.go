package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// HTTP metrics
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// WebSocket metrics
	WebSocketConnectionsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "websocket_connections_total",
			Help: "Total number of WebSocket connections",
		},
	)

	WebSocketConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "websocket_connections_active",
			Help: "Number of active WebSocket connections",
		},
	)

	WebSocketMessagesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "websocket_messages_total",
			Help: "Total number of WebSocket messages",
		},
		[]string{"type", "direction"}, // direction: sent/received
	)

	// Game metrics
	UsersOnline = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "game_users_online",
			Help: "Number of online users",
		},
	)

	UsersTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "game_users_total",
			Help: "Total number of registered users",
		},
	)

	BuildingsCreated = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "game_buildings_created_total",
			Help: "Total number of buildings created",
		},
		[]string{"type"},
	)

	ResourcesGenerated = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "game_resources_generated_total",
			Help: "Total resources generated",
		},
		[]string{"resource_type"},
	)

	ResourcesCollected = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "game_resources_collected_total",
			Help: "Total resources collected by players",
		},
		[]string{"resource_type"},
	)

	// Database metrics
	DBQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "db_queries_total",
			Help: "Total number of database queries",
		},
		[]string{"query_type", "table"},
	)

	DBQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "db_query_duration_seconds",
			Help:    "Database query duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"query_type"},
	)

	DBConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "db_connections_active",
			Help: "Number of active database connections",
		},
	)

	// Cache metrics
	CacheHits = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "cache_hits_total",
			Help: "Total number of cache hits",
		},
	)

	CacheMisses = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "cache_misses_total",
			Help: "Total number of cache misses",
		},
	)

	CacheOperationDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "cache_operation_duration_seconds",
			Help:    "Cache operation duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation"}, // get, set, delete
	)

	// Business metrics
	AuthenticationsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "auth_total",
			Help: "Total number of authentication attempts",
		},
		[]string{"method", "status"}, // method: telegram, refresh; status: success, failure
	)

	GuildsCreated = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "guilds_created_total",
			Help: "Total number of guilds created",
		},
	)

	BattlesTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "battles_total",
			Help: "Total number of battles",
		},
	)

	// Error metrics
	ErrorsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
		[]string{"service", "type"},
	)
)

// RecordHTTPRequest records HTTP request metrics
func RecordHTTPRequest(method, endpoint, status string, duration float64) {
	HTTPRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
	HTTPRequestDuration.WithLabelValues(method, endpoint).Observe(duration)
}

// RecordWebSocketMessage records WebSocket message metrics
func RecordWebSocketMessage(messageType, direction string) {
	WebSocketMessagesTotal.WithLabelValues(messageType, direction).Inc()
}

// RecordDBQuery records database query metrics
func RecordDBQuery(queryType, table string, duration float64) {
	DBQueriesTotal.WithLabelValues(queryType, table).Inc()
	DBQueryDuration.WithLabelValues(queryType).Observe(duration)
}

// RecordCacheOperation records cache operation metrics
func RecordCacheOperation(operation string, duration float64, hit bool) {
	CacheOperationDuration.WithLabelValues(operation).Observe(duration)
	if operation == "get" {
		if hit {
			CacheHits.Inc()
		} else {
			CacheMisses.Inc()
		}
	}
}

// RecordAuthentication records authentication metrics
func RecordAuthentication(method string, success bool) {
	status := "failure"
	if success {
		status = "success"
	}
	AuthenticationsTotal.WithLabelValues(method, status).Inc()
}

// RecordError records error metrics
func RecordError(service, errorType string) {
	ErrorsTotal.WithLabelValues(service, errorType).Inc()
}