package game

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ton-empire/backend/internal/common/database"
	"github.com/ton-empire/backend/pkg/models"
)

type Repository struct {
	db *database.DB
}

func NewRepository(db *database.DB) *Repository {
	return &Repository{db: db}
}

// District operations

func (r *Repository) GetDistrictByUserID(ctx context.Context, userID uuid.UUID) (*models.District, error) {
	var district models.District
	query := `
		SELECT id, owner_id, city_id, name, population, efficiency, 
		       created_at, updated_at
		FROM districts 
		WHERE owner_id = $1`
	
	err := r.db.GetContext(ctx, &district, query, userID)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("district not found")
	}
	if err != nil {
		return nil, err
	}

	// Load resources
	resources, err := r.getDistrictResources(ctx, district.ID)
	if err != nil {
		return nil, err
	}
	district.Resources = resources

	return &district, nil
}

func (r *Repository) GetDistrictByID(ctx context.Context, districtID uuid.UUID) (*models.District, error) {
	var district models.District
	query := `
		SELECT id, owner_id, city_id, name, population, efficiency, 
		       created_at, updated_at
		FROM districts 
		WHERE id = $1`
	
	err := r.db.GetContext(ctx, &district, query, districtID)
	if err != nil {
		return nil, err
	}

	// Load resources
	resources, err := r.getDistrictResources(ctx, district.ID)
	if err != nil {
		return nil, err
	}
	district.Resources = resources

	return &district, nil
}

func (r *Repository) CreateDistrict(ctx context.Context, district *models.District) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert district
	query := `
		INSERT INTO districts (id, owner_id, city_id, name, population, efficiency, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	
	_, err = tx.ExecContext(ctx, query,
		district.ID, district.OwnerID, district.CityID, district.Name,
		district.Population, district.Efficiency, district.CreatedAt, district.UpdatedAt)
	if err != nil {
		return err
	}

	// Initialize resources
	for resourceType, amount := range district.Resources {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO district_resources (district_id, resource_type, amount) VALUES ($1, $2, $3)`,
			district.ID, resourceType, amount)
		if err != nil {
			return err
		}
	}

	// Update user's district_id
	_, err = tx.ExecContext(ctx,
		`UPDATE users SET district_id = $1 WHERE id = $2`,
		district.ID, district.OwnerID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) UpdateDistrictResources(ctx context.Context, districtID uuid.UUID, resources map[models.ResourceType]int64) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for resourceType, amount := range resources {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO district_resources (district_id, resource_type, amount) 
			VALUES ($1, $2, $3)
			ON CONFLICT (district_id, resource_type) 
			DO UPDATE SET amount = $3, updated_at = CURRENT_TIMESTAMP`,
			districtID, resourceType, amount)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *Repository) getDistrictResources(ctx context.Context, districtID uuid.UUID) (map[models.ResourceType]int64, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT resource_type, amount FROM district_resources WHERE district_id = $1`,
		districtID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resources := make(map[models.ResourceType]int64)
	for rows.Next() {
		var resourceType models.ResourceType
		var amount int64
		if err := rows.Scan(&resourceType, &amount); err != nil {
			return nil, err
		}
		resources[resourceType] = amount
	}

	return resources, rows.Err()
}

// Building operations

func (r *Repository) GetBuildingsByDistrict(ctx context.Context, districtID uuid.UUID) ([]*models.Building, error) {
	var buildings []*models.Building
	query := `
		SELECT id, district_id, type, level, health, max_health, 
		       position_x, position_y, is_active, upgrade_end_at, 
		       created_at, updated_at
		FROM buildings 
		WHERE district_id = $1
		ORDER BY created_at`
	
	rows, err := r.db.QueryContext(ctx, query, districtID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var b models.Building
		err := rows.Scan(&b.ID, &b.DistrictID, &b.Type, &b.Level, 
			&b.Health, &b.MaxHealth, &b.Position.X, &b.Position.Y,
			&b.IsActive, &b.UpgradeEndAt, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return nil, err
		}
		buildings = append(buildings, &b)
	}

	return buildings, rows.Err()
}

func (r *Repository) CreateBuilding(ctx context.Context, building *models.Building) error {
	query := `
		INSERT INTO buildings (id, district_id, type, level, health, max_health,
		                      position_x, position_y, is_active, upgrade_end_at,
		                      created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
	
	_, err := r.db.ExecContext(ctx, query,
		building.ID, building.DistrictID, building.Type, building.Level,
		building.Health, building.MaxHealth, building.Position.X, building.Position.Y,
		building.IsActive, building.UpgradeEndAt, building.CreatedAt, building.UpdatedAt)
	
	if err != nil {
		return fmt.Errorf("failed to create building: %w", err)
	}

	// Initialize production if applicable
	if production := getDefaultProduction(building.Type); production != nil {
		for _, prod := range production {
			_, err = r.db.ExecContext(ctx,
				`INSERT INTO building_production (building_id, resource_type, rate, last_collected)
				VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
				building.ID, prod.ResourceType, prod.Rate)
			if err != nil {
				return fmt.Errorf("failed to create production: %w", err)
			}
		}
	}

	return nil
}

func (r *Repository) UpdateBuilding(ctx context.Context, building *models.Building) error {
	query := `
		UPDATE buildings 
		SET level = $1, health = $2, max_health = $3, is_active = $4,
		    upgrade_end_at = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6`
	
	_, err := r.db.ExecContext(ctx, query,
		building.Level, building.Health, building.MaxHealth,
		building.IsActive, building.UpgradeEndAt, building.ID)
	
	return err
}

func (r *Repository) GetBuildingProduction(ctx context.Context, buildingID uuid.UUID) ([]*models.BuildingProduction, error) {
	var production []*models.BuildingProduction
	query := `
		SELECT building_id, resource_type, rate, last_collected
		FROM building_production
		WHERE building_id = $1`
	
	err := r.db.SelectContext(ctx, &production, query, buildingID)
	return production, err
}

func (r *Repository) UpdateProductionCollected(ctx context.Context, buildingID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE building_production 
		SET last_collected = CURRENT_TIMESTAMP 
		WHERE building_id = $1`,
		buildingID)
	return err
}

// Guild operations

func (r *Repository) GetGuildByID(ctx context.Context, guildID uuid.UUID) (*models.Guild, error) {
	var guild models.Guild
	query := `
		SELECT id, name, tag, description, emperor_id, level, experience,
		       member_count, max_members, created_at, updated_at
		FROM guilds 
		WHERE id = $1`
	
	err := r.db.GetContext(ctx, &guild, query, guildID)
	if err != nil {
		return nil, err
	}

	// Load treasury
	treasury, err := r.getGuildTreasury(ctx, guild.ID)
	if err != nil {
		return nil, err
	}
	guild.Treasury = treasury

	return &guild, nil
}

func (r *Repository) CreateGuild(ctx context.Context, guild *models.Guild) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert guild
	query := `
		INSERT INTO guilds (id, name, tag, description, emperor_id, level, experience,
		                   member_count, max_members, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	
	_, err = tx.ExecContext(ctx, query,
		guild.ID, guild.Name, guild.Tag, guild.Description, guild.EmperorID,
		guild.Level, guild.Experience, guild.MemberCount, guild.MaxMembers,
		guild.CreatedAt, guild.UpdatedAt)
	if err != nil {
		return err
	}

	// Add emperor as member
	_, err = tx.ExecContext(ctx,
		`INSERT INTO guild_members (guild_id, user_id, role, joined_at)
		VALUES ($1, $2, 'emperor', CURRENT_TIMESTAMP)`,
		guild.ID, guild.EmperorID)
	if err != nil {
		return err
	}

	// Update user's guild_id
	_, err = tx.ExecContext(ctx,
		`UPDATE users SET guild_id = $1 WHERE id = $2`,
		guild.ID, guild.EmperorID)
	if err != nil {
		return err
	}

	// Initialize treasury
	for resourceType := range guild.Treasury {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO guild_treasury (guild_id, resource_type, amount) VALUES ($1, $2, 0)`,
			guild.ID, resourceType)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *Repository) JoinGuild(ctx context.Context, guildID, userID uuid.UUID, role models.GuildRole) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Add member
	_, err = tx.ExecContext(ctx,
		`INSERT INTO guild_members (guild_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
		guildID, userID, role)
	if err != nil {
		return err
	}

	// Update user's guild_id
	_, err = tx.ExecContext(ctx,
		`UPDATE users SET guild_id = $1 WHERE id = $2`,
		guildID, userID)
	if err != nil {
		return err
	}

	// Update guild member count
	_, err = tx.ExecContext(ctx,
		`UPDATE guilds SET member_count = member_count + 1 WHERE id = $1`,
		guildID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) LeaveGuild(ctx context.Context, guildID, userID uuid.UUID) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Remove member
	_, err = tx.ExecContext(ctx,
		`DELETE FROM guild_members WHERE guild_id = $1 AND user_id = $2`,
		guildID, userID)
	if err != nil {
		return err
	}

	// Update user's guild_id
	_, err = tx.ExecContext(ctx,
		`UPDATE users SET guild_id = NULL WHERE id = $1`,
		userID)
	if err != nil {
		return err
	}

	// Update guild member count
	_, err = tx.ExecContext(ctx,
		`UPDATE guilds SET member_count = member_count - 1 WHERE id = $1`,
		guildID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) getGuildTreasury(ctx context.Context, guildID uuid.UUID) (map[models.ResourceType]int64, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT resource_type, amount FROM guild_treasury WHERE guild_id = $1`,
		guildID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	treasury := make(map[models.ResourceType]int64)
	for rows.Next() {
		var resourceType models.ResourceType
		var amount int64
		if err := rows.Scan(&resourceType, &amount); err != nil {
			return nil, err
		}
		treasury[resourceType] = amount
	}

	return treasury, rows.Err()
}

// Helper functions

func getDefaultProduction(buildingType models.BuildingType) []models.BuildingProduction {
	switch buildingType {
	case models.BuildingFarm:
		return []models.BuildingProduction{
			{ResourceType: models.ResourceFood, Rate: 100},
		}
	case models.BuildingMine:
		return []models.BuildingProduction{
			{ResourceType: models.ResourceGold, Rate: 50},
			{ResourceType: models.ResourceStone, Rate: 75},
		}
	case models.BuildingLumberMill:
		return []models.BuildingProduction{
			{ResourceType: models.ResourceWood, Rate: 80},
		}
	case models.BuildingPowerPlant:
		return []models.BuildingProduction{
			{ResourceType: models.ResourceEnergy, Rate: 60},
		}
	default:
		return nil
	}
}