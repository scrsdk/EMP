-- Drop triggers
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
DROP TRIGGER IF EXISTS update_buildings_updated_at ON buildings;
DROP TRIGGER IF EXISTS update_districts_updated_at ON districts;
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
DROP TRIGGER IF EXISTS update_guilds_updated_at ON guilds;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove foreign key constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_guild_id;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_district_id;

-- Drop tables in reverse order of creation (to handle foreign key constraints)
DROP TABLE IF EXISTS guild_treasury;
DROP TABLE IF EXISTS building_production;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS district_resources;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS guild_members;
DROP TABLE IF EXISTS guilds;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";