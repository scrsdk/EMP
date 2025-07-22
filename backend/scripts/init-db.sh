#!/bin/bash

# Database initialization script for TON Empire

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-ton_empire}"

echo -e "${YELLOW}Initializing TON Empire database...${NC}"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo -e "${GREEN}PostgreSQL is ready!${NC}"

# Create database if it doesn't exist
echo "Creating database $DB_NAME if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<-EOSQL
    SELECT 'CREATE DATABASE $DB_NAME'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOSQL

# Run migrations
echo "Running database migrations..."
cd "$(dirname "$0")/.."

# Check if migrate is installed
if ! command -v migrate &> /dev/null; then
    echo -e "${YELLOW}Installing golang-migrate...${NC}"
    go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
fi

# Run migrations
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable"
migrate -path migrations -database "$DATABASE_URL" up

echo -e "${GREEN}Database initialization completed successfully!${NC}"

# Optional: Create test data
if [ "$1" == "--with-test-data" ]; then
    echo -e "${YELLOW}Creating test data...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
        -- Insert test user
        INSERT INTO users (id, telegram_id, username, first_name, last_name, level, experience)
        VALUES 
            ('11111111-1111-1111-1111-111111111111', 123456789, 'testuser', 'Test', 'User', 5, 4500),
            ('22222222-2222-2222-2222-222222222222', 987654321, 'player2', 'Player', 'Two', 3, 2100);
        
        -- Insert test guild
        INSERT INTO guilds (id, name, tag, description, emperor_id, level, experience, member_count, max_members)
        VALUES ('33333333-3333-3333-3333-333333333333', 'Test Guild', 'TEST', 'A test guild for development', '11111111-1111-1111-1111-111111111111', 2, 1500, 2, 50);
        
        -- Add guild members
        INSERT INTO guild_members (guild_id, user_id, role)
        VALUES 
            ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'emperor'),
            ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'citizen');
        
        -- Update users with guild
        UPDATE users SET guild_id = '33333333-3333-3333-3333-333333333333' 
        WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
        
        -- Create test city
        INSERT INTO cities (id, guild_id, name, level, population, defense)
        VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Test City', 1, 1000, 100.0);
        
        -- Create test districts
        INSERT INTO districts (id, owner_id, city_id, name, population, efficiency)
        VALUES 
            ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Test District 1', 250, 95.5),
            ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Test District 2', 180, 88.0);
        
        -- Update users with districts
        UPDATE users SET district_id = '55555555-5555-5555-5555-555555555555' WHERE id = '11111111-1111-1111-1111-111111111111';
        UPDATE users SET district_id = '66666666-6666-6666-6666-666666666666' WHERE id = '22222222-2222-2222-2222-222222222222';
        
        -- Initialize district resources
        INSERT INTO district_resources (district_id, resource_type, amount)
        VALUES 
            ('55555555-5555-5555-5555-555555555555', 'gold', 5000),
            ('55555555-5555-5555-5555-555555555555', 'wood', 2500),
            ('55555555-5555-5555-5555-555555555555', 'stone', 2000),
            ('55555555-5555-5555-5555-555555555555', 'food', 3000),
            ('55555555-5555-5555-5555-555555555555', 'energy', 500),
            ('66666666-6666-6666-6666-666666666666', 'gold', 3000),
            ('66666666-6666-6666-6666-666666666666', 'wood', 1500),
            ('66666666-6666-6666-6666-666666666666', 'stone', 1200),
            ('66666666-6666-6666-6666-666666666666', 'food', 2000),
            ('66666666-6666-6666-6666-666666666666', 'energy', 300);
        
        -- Create test buildings
        INSERT INTO buildings (id, district_id, type, level, health, max_health, position_x, position_y, is_active)
        VALUES 
            ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'town_hall', 2, 120, 120, 5, 5, true),
            ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'farm', 1, 100, 100, 3, 3, true),
            ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'mine', 1, 100, 100, 7, 7, true);
        
        -- Initialize building production
        INSERT INTO building_production (building_id, resource_type, rate)
        VALUES 
            ('88888888-8888-8888-8888-888888888888', 'food', 100),
            ('99999999-9999-9999-9999-999999999999', 'gold', 50),
            ('99999999-9999-9999-9999-999999999999', 'stone', 75);
        
        -- Initialize guild treasury
        INSERT INTO guild_treasury (guild_id, resource_type, amount)
        VALUES 
            ('33333333-3333-3333-3333-333333333333', 'gold', 10000),
            ('33333333-3333-3333-3333-333333333333', 'wood', 5000),
            ('33333333-3333-3333-3333-333333333333', 'stone', 4000),
            ('33333333-3333-3333-3333-333333333333', 'food', 6000),
            ('33333333-3333-3333-3333-333333333333', 'energy', 1000);
        
        -- Initialize user stats
        INSERT INTO user_stats (user_id, total_buildings, total_battles, battles_won, resources_gathered, play_time)
        VALUES 
            ('11111111-1111-1111-1111-111111111111', 3, 10, 7, 50000, 36000),
            ('22222222-2222-2222-2222-222222222222', 1, 5, 2, 15000, 18000);
        
        echo -e "${GREEN}Test data created successfully!${NC}"
EOSQL
fi