-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    photo_url TEXT,
    wallet_address VARCHAR(255),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    experience BIGINT DEFAULT 0 CHECK (experience >= 0),
    guild_id UUID,
    district_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) UNIQUE NOT NULL,
    user_agent TEXT,
    ip VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User stats table
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_buildings INTEGER DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    resources_gathered BIGINT DEFAULT 0,
    play_time BIGINT DEFAULT 0, -- in seconds
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guilds table
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    tag VARCHAR(5) UNIQUE NOT NULL,
    description TEXT,
    emperor_id UUID NOT NULL REFERENCES users(id),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    experience BIGINT DEFAULT 0 CHECK (experience >= 0),
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guild members table
CREATE TABLE guild_members (
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('emperor', 'governor', 'citizen', 'vassal')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id)
);

-- Cities table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    population INTEGER DEFAULT 0 CHECK (population >= 0),
    defense DECIMAL(10, 2) DEFAULT 100.0 CHECK (defense >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, name)
);

-- Districts table
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    population INTEGER DEFAULT 0 CHECK (population >= 0),
    efficiency DECIMAL(5, 2) DEFAULT 100.0 CHECK (efficiency >= 0 AND efficiency <= 200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, city_id)
);

-- Resources table (stores current resources for districts)
CREATE TABLE district_resources (
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('gold', 'wood', 'stone', 'food', 'energy')),
    amount BIGINT DEFAULT 0 CHECK (amount >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (district_id, resource_type)
);

-- Buildings table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    health DECIMAL(10, 2) NOT NULL,
    max_health DECIMAL(10, 2) NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    upgrade_end_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, position_x, position_y)
);

-- Building production table
CREATE TABLE building_production (
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('gold', 'wood', 'stone', 'food', 'energy')),
    rate BIGINT DEFAULT 0 CHECK (rate >= 0), -- per hour
    last_collected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (building_id, resource_type)
);

-- Guild treasury table
CREATE TABLE guild_treasury (
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('gold', 'wood', 'stone', 'food', 'energy')),
    amount BIGINT DEFAULT 0 CHECK (amount >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, resource_type)
);

-- Add foreign key constraints after all tables are created
ALTER TABLE users ADD CONSTRAINT fk_users_guild_id FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_district_id FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

-- Create indexes separately (PostgreSQL style)
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_guild_id ON users(guild_id);
CREATE INDEX idx_users_level ON users(level);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_guilds_tag ON guilds(tag);
CREATE INDEX idx_guilds_emperor_id ON guilds(emperor_id);
CREATE INDEX idx_guilds_level ON guilds(level);

CREATE INDEX idx_guild_members_user_id ON guild_members(user_id);

CREATE INDEX idx_cities_guild_id ON cities(guild_id);

CREATE INDEX idx_districts_owner_id ON districts(owner_id);
CREATE INDEX idx_districts_city_id ON districts(city_id);

CREATE INDEX idx_buildings_district_id ON buildings(district_id);
CREATE INDEX idx_buildings_type ON buildings(type);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();