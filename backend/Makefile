.PHONY: help build run test clean docker-build docker-up docker-down migrate

# Default target
help:
	@echo "Available targets:"
	@echo "  build          - Build all services"
	@echo "  run-gateway    - Run API Gateway"
	@echo "  run-auth       - Run Auth Service"
	@echo "  run-user       - Run User Service"
	@echo "  run-game       - Run Game Service"
	@echo "  test           - Run tests"
	@echo "  clean          - Clean build artifacts"
	@echo "  docker-build   - Build Docker images"
	@echo "  docker-up      - Start Docker containers"
	@echo "  docker-down    - Stop Docker containers"
	@echo "  migrate-up     - Run database migrations"
	@echo "  migrate-down   - Rollback database migrations"

# Build targets
build:
	go build -o bin/api-gateway ./cmd/api-gateway
	go build -o bin/auth-service ./cmd/auth-service
	go build -o bin/user-service ./cmd/user-service
	go build -o bin/game-service ./cmd/game-service

build-gateway:
	go build -o bin/api-gateway ./cmd/api-gateway

build-auth:
	go build -o bin/auth-service ./cmd/auth-service

build-user:
	go build -o bin/user-service ./cmd/user-service

build-game:
	go build -o bin/game-service ./cmd/game-service

# Run targets
run-gateway: build-gateway
	./bin/api-gateway

run-auth: build-auth
	./bin/auth-service

run-user: build-user
	./bin/user-service

run-game: build-game
	./bin/game-service

# Test target
test:
	go test -v -race ./...

# Clean target
clean:
	rm -rf bin/
	go clean -cache

# Docker targets
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Database migrations
migrate-up:
	migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/ton_empire?sslmode=disable" up

migrate-down:
	migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/ton_empire?sslmode=disable" down

migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir migrations -seq $$name

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	@cp .env.example .env
	@echo "Please edit .env file with your configuration"
	@echo "Installing dependencies..."
	@go mod download
	@echo "Starting infrastructure services..."
	@docker-compose up -d postgres redis
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Running migrations..."
	@make migrate-up
	@echo "Development environment is ready!"

# Linting
lint:
	golangci-lint run ./...

# Format code
fmt:
	go fmt ./...
	gofumpt -w .