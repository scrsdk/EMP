# TON Empire Backend

Backend microservices for TON Empire - a blockchain-based social strategy game for the TON ecosystem.

## Architecture

The backend follows a microservices architecture with the following services:

- **API Gateway** (port 8080) - Main entry point, routes requests to appropriate services
- **Auth Service** (port 8081) - Handles Telegram authentication and JWT tokens
- **User Service** (port 8082) - Manages user profiles and stats
- **Game Service** (port 8083) - Core game logic, districts, buildings, resources

## Tech Stack

- **Language**: Go 1.21
- **Web Framework**: Gin
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Container**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Go 1.21+
- Docker and Docker Compose
- PostgreSQL client (optional)
- Make

### Quick Start

1. Clone the repository and navigate to backend:
   ```bash
   cd backend
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your configuration (especially `TELEGRAM_BOT_TOKEN`)

4. Run development setup:
   ```bash
   make dev-setup
   ```

5. Start all services:
   ```bash
   make docker-up
   ```

### Development

Run individual services locally:

```bash
# Start infrastructure (DB & Redis)
docker-compose up -d postgres redis

# Run specific service
make run-gateway
make run-auth
make run-user
make run-game
```

### Testing

```bash
# Run all tests
make test

# Run tests for specific package
go test -v ./internal/auth/...
```

### Database Migrations

```bash
# Apply migrations
make migrate-up

# Rollback migrations
make migrate-down

# Create new migration
make migrate-create
```

## API Documentation

### Authentication

All endpoints except `/health` and `/api/v1/auth/*` require JWT authentication.

Include token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Auth Service
- `POST /api/v1/auth/telegram` - Authenticate with Telegram Mini App
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and invalidate refresh token

#### User Service
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users/:id` - Get user by ID

#### Game Service
- `GET /api/v1/game/districts/mine` - Get current user's district
- `POST /api/v1/game/districts/buildings` - Create new building
- `PUT /api/v1/game/districts/buildings/:id` - Update building
- `POST /api/v1/game/districts/collect` - Collect resources

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TELEGRAM_BOT_TOKEN | Your Telegram bot token | - |
| TELEGRAM_WEBAPP_URL | URL of your Telegram Mini App | - |
| JWT_SECRET | Secret key for JWT signing | - |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |

## Project Structure

```
backend/
├── cmd/                    # Service entry points
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   └── game-service/
├── internal/               # Private application code
│   ├── auth/              # Auth service logic
│   ├── user/              # User service logic
│   ├── game/              # Game service logic
│   └── common/            # Shared code
│       ├── config/        # Configuration
│       ├── database/      # Database connections
│       ├── middleware/    # HTTP middleware
│       └── utils/         # Utilities
├── pkg/                    # Public packages
│   ├── models/            # Data models
│   ├── errors/            # Custom errors
│   └── logger/            # Logging
├── migrations/             # Database migrations
├── docker/                 # Dockerfiles
├── config/                 # Configuration files
└── scripts/                # Utility scripts
```

## Contributing

1. Create feature branch from `main`
2. Make changes and add tests
3. Run `make fmt` and `make lint`
4. Submit pull request

## License

Proprietary - All rights reserved