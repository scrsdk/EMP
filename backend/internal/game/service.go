package game

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/ton-empire/backend/pkg/models"
	"github.com/ton-empire/backend/pkg/logger"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// District operations

func (s *Service) GetUserDistrict(ctx context.Context, userID uuid.UUID) (*models.District, error) {
	district, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err != nil {
		// If no district exists, create one
		if err.Error() == "district not found" {
			return s.createStarterDistrict(ctx, userID)
		}
		return nil, fmt.Errorf("failed to get district: %w", err)
	}
	return district, nil
}

func (s *Service) createStarterDistrict(ctx context.Context, userID uuid.UUID) (*models.District, error) {
	// For MVP, create a district in a default city
	// In full version, this would involve city/guild selection
	
	district := &models.District{
		ID:         uuid.New(),
		OwnerID:    userID,
		CityID:     uuid.New(), // Default city for now
		Name:       "Starter District",
		Population: 100,
		Efficiency: 100.0,
		Resources: map[models.ResourceType]int64{
			models.ResourceGold:   1000,
			models.ResourceWood:   500,
			models.ResourceStone:  500,
			models.ResourceFood:   1000,
			models.ResourceEnergy: 100,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.CreateDistrict(ctx, district); err != nil {
		return nil, fmt.Errorf("failed to create starter district: %w", err)
	}

	// Create starter buildings
	townHall := &models.Building{
		ID:         uuid.New(),
		DistrictID: district.ID,
		Type:       models.BuildingTownHall,
		Level:      1,
		Health:     100,
		MaxHealth:  100,
		Position:   models.Position{X: 5, Y: 5},
		IsActive:   true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := s.repo.CreateBuilding(ctx, townHall); err != nil {
		logger.Errorf("Failed to create starter town hall: %v", err)
	}

	return district, nil
}

// Building operations

func (s *Service) GetDistrictBuildings(ctx context.Context, districtID uuid.UUID) ([]*models.Building, error) {
	buildings, err := s.repo.GetBuildingsByDistrict(ctx, districtID)
	if err != nil {
		return nil, fmt.Errorf("failed to get buildings: %w", err)
	}
	return buildings, nil
}

func (s *Service) CreateBuilding(ctx context.Context, userID uuid.UUID, req CreateBuildingRequest) (*models.Building, error) {
	// Get user's district
	district, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("district not found: %w", err)
	}

	// Validate building placement
	if err := s.validateBuildingPlacement(ctx, district.ID, req.Position); err != nil {
		return nil, err
	}

	// Check resource requirements
	cost := getBuildingCost(req.Type, 1)
	if !s.hasEnoughResources(district.Resources, cost) {
		return nil, fmt.Errorf("insufficient resources")
	}

	// Create building
	building := &models.Building{
		ID:         uuid.New(),
		DistrictID: district.ID,
		Type:       req.Type,
		Level:      1,
		Health:     100,
		MaxHealth:  100,
		Position:   req.Position,
		IsActive:   true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Deduct resources
	for resourceType, amount := range cost {
		district.Resources[resourceType] -= amount
	}

	// Save building
	if err := s.repo.CreateBuilding(ctx, building); err != nil {
		return nil, fmt.Errorf("failed to create building: %w", err)
	}

	// Update district resources
	if err := s.repo.UpdateDistrictResources(ctx, district.ID, district.Resources); err != nil {
		return nil, fmt.Errorf("failed to update resources: %w", err)
	}

	logger.Infof("Building created: %s at (%d,%d) in district %s", 
		building.Type, building.Position.X, building.Position.Y, district.ID)

	return building, nil
}

func (s *Service) UpgradeBuilding(ctx context.Context, userID uuid.UUID, buildingID uuid.UUID) (*models.Building, error) {
	// Get user's district
	district, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("district not found: %w", err)
	}

	// Get buildings to verify ownership
	buildings, err := s.repo.GetBuildingsByDistrict(ctx, district.ID)
	if err != nil {
		return nil, err
	}

	var building *models.Building
	for _, b := range buildings {
		if b.ID == buildingID {
			building = b
			break
		}
	}

	if building == nil {
		return nil, fmt.Errorf("building not found")
	}

	// Check if already upgrading
	if building.UpgradeEndAt != nil && building.UpgradeEndAt.After(time.Now()) {
		return nil, fmt.Errorf("building is already upgrading")
	}

	// Check resource requirements
	cost := getBuildingCost(building.Type, building.Level+1)
	if !s.hasEnoughResources(district.Resources, cost) {
		return nil, fmt.Errorf("insufficient resources")
	}

	// Start upgrade
	upgradeDuration := getUpgradeDuration(building.Type, building.Level+1)
	upgradeEndAt := time.Now().Add(upgradeDuration)
	building.UpgradeEndAt = &upgradeEndAt

	// Deduct resources
	for resourceType, amount := range cost {
		district.Resources[resourceType] -= amount
	}

	// Update building
	if err := s.repo.UpdateBuilding(ctx, building); err != nil {
		return nil, fmt.Errorf("failed to update building: %w", err)
	}

	// Update district resources
	if err := s.repo.UpdateDistrictResources(ctx, district.ID, district.Resources); err != nil {
		return nil, fmt.Errorf("failed to update resources: %w", err)
	}

	return building, nil
}

func (s *Service) CollectResources(ctx context.Context, userID uuid.UUID) (*CollectResult, error) {
	// Get user's district
	district, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("district not found: %w", err)
	}

	// Get all buildings
	buildings, err := s.repo.GetBuildingsByDistrict(ctx, district.ID)
	if err != nil {
		return nil, err
	}

	collected := make(map[models.ResourceType]int64)
	now := time.Now()

	// Calculate resources from each building
	for _, building := range buildings {
		if !building.IsActive {
			continue
		}

		// Check if upgrade completed
		if building.UpgradeEndAt != nil && building.UpgradeEndAt.Before(now) {
			building.Level++
			building.UpgradeEndAt = nil
			building.MaxHealth = float64(100 + (building.Level-1)*20)
			building.Health = building.MaxHealth
			
			if err := s.repo.UpdateBuilding(ctx, building); err != nil {
				logger.Errorf("Failed to complete upgrade for building %s: %v", building.ID, err)
			}
		}

		// Get production data
		production, err := s.repo.GetBuildingProduction(ctx, building.ID)
		if err != nil {
			logger.Errorf("Failed to get production for building %s: %v", building.ID, err)
			continue
		}

		// Calculate resources
		for _, prod := range production {
			if prod.LastCollected.IsZero() {
				prod.LastCollected = building.CreatedAt
			}
			
			duration := now.Sub(prod.LastCollected).Hours()
			amount := int64(float64(prod.Rate) * duration * (float64(building.Level) * 1.2))
			
			collected[prod.ResourceType] += amount
			district.Resources[prod.ResourceType] += amount
		}

		// Update last collected time
		if err := s.repo.UpdateProductionCollected(ctx, building.ID); err != nil {
			logger.Errorf("Failed to update collection time for building %s: %v", building.ID, err)
		}
	}

	// Update district resources
	if err := s.repo.UpdateDistrictResources(ctx, district.ID, district.Resources); err != nil {
		return nil, fmt.Errorf("failed to update resources: %w", err)
	}

	return &CollectResult{
		Collected:      collected,
		TotalResources: district.Resources,
	}, nil
}

// Guild operations

func (s *Service) CreateGuild(ctx context.Context, userID uuid.UUID, req CreateGuildRequest) (*models.Guild, error) {
	// Check if user already in a guild
	user, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err == nil && user.OwnerID != uuid.Nil {
		// Check if user has guild through another query
		// For now, we'll skip this check in MVP
	}

	guild := &models.Guild{
		ID:          uuid.New(),
		Name:        req.Name,
		Tag:         req.Tag,
		Description: req.Description,
		EmperorID:   userID,
		Level:       1,
		Experience:  0,
		MemberCount: 1,
		MaxMembers:  50,
		Treasury: map[models.ResourceType]int64{
			models.ResourceGold:   0,
			models.ResourceWood:   0,
			models.ResourceStone:  0,
			models.ResourceFood:   0,
			models.ResourceEnergy: 0,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.CreateGuild(ctx, guild); err != nil {
		return nil, fmt.Errorf("failed to create guild: %w", err)
	}

	logger.Infof("Guild created: %s [%s] by user %s", guild.Name, guild.Tag, userID)
	return guild, nil
}

func (s *Service) JoinGuild(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) error {
	// Get guild
	guild, err := s.repo.GetGuildByID(ctx, guildID)
	if err != nil {
		return fmt.Errorf("guild not found: %w", err)
	}

	// Check if guild is full
	if guild.MemberCount >= guild.MaxMembers {
		return fmt.Errorf("guild is full")
	}

	// Add user as citizen
	if err := s.repo.JoinGuild(ctx, guildID, userID, models.GuildRoleCitizen); err != nil {
		return fmt.Errorf("failed to join guild: %w", err)
	}

	return nil
}

func (s *Service) LeaveGuild(ctx context.Context, userID uuid.UUID) error {
	// Get user's district to find guild
	district, err := s.repo.GetDistrictByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// For MVP, we need to get user's guild ID from user table
	// This would be improved with proper user service integration
	
	// Placeholder guild ID
	guildID := uuid.New() // This should come from user data

	if err := s.repo.LeaveGuild(ctx, guildID, userID); err != nil {
		return fmt.Errorf("failed to leave guild: %w", err)
	}

	return nil
}

// Helper functions

func (s *Service) validateBuildingPlacement(ctx context.Context, districtID uuid.UUID, position models.Position) error {
	// Check bounds (10x10 grid for MVP)
	if position.X < 0 || position.X >= 10 || position.Y < 0 || position.Y >= 10 {
		return fmt.Errorf("position out of bounds")
	}

	// Check if position is occupied
	buildings, err := s.repo.GetBuildingsByDistrict(ctx, districtID)
	if err != nil {
		return err
	}

	for _, building := range buildings {
		if building.Position.X == position.X && building.Position.Y == position.Y {
			return fmt.Errorf("position already occupied")
		}
	}

	return nil
}

func (s *Service) hasEnoughResources(available, required map[models.ResourceType]int64) bool {
	for resourceType, amount := range required {
		if available[resourceType] < amount {
			return false
		}
	}
	return true
}

func getBuildingCost(buildingType models.BuildingType, level int) map[models.ResourceType]int64 {
	baseCosts := map[models.BuildingType]map[models.ResourceType]int64{
		models.BuildingHouse: {
			models.ResourceWood:  100,
			models.ResourceStone: 50,
			models.ResourceGold:  25,
		},
		models.BuildingFarm: {
			models.ResourceWood: 150,
			models.ResourceGold: 50,
		},
		models.BuildingMine: {
			models.ResourceWood:  200,
			models.ResourceStone: 100,
			models.ResourceGold:  100,
		},
		models.BuildingLumberMill: {
			models.ResourceStone: 150,
			models.ResourceGold:  75,
		},
		models.BuildingPowerPlant: {
			models.ResourceStone: 300,
			models.ResourceGold:  200,
		},
		models.BuildingBarracks: {
			models.ResourceWood:  250,
			models.ResourceStone: 250,
			models.ResourceGold:  150,
		},
		models.BuildingWall: {
			models.ResourceStone: 500,
			models.ResourceWood:  100,
		},
		models.BuildingMarket: {
			models.ResourceWood:  200,
			models.ResourceStone: 200,
			models.ResourceGold:  300,
		},
	}

	cost := make(map[models.ResourceType]int64)
	if baseCost, ok := baseCosts[buildingType]; ok {
		multiplier := math.Pow(1.5, float64(level-1))
		for resourceType, amount := range baseCost {
			cost[resourceType] = int64(float64(amount) * multiplier)
		}
	}

	return cost
}

func getUpgradeDuration(buildingType models.BuildingType, level int) time.Duration {
	baseMinutes := map[models.BuildingType]int{
		models.BuildingHouse:      5,
		models.BuildingFarm:       10,
		models.BuildingMine:       15,
		models.BuildingLumberMill: 12,
		models.BuildingPowerPlant: 20,
		models.BuildingBarracks:   25,
		models.BuildingWall:       30,
		models.BuildingMarket:     15,
		models.BuildingTownHall:   60,
	}

	minutes := baseMinutes[buildingType] * level
	return time.Duration(minutes) * time.Minute
}

// Request/Response types

type CreateBuildingRequest struct {
	Type     models.BuildingType `json:"type" binding:"required"`
	Position models.Position     `json:"position" binding:"required"`
}

type CreateGuildRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=50"`
	Tag         string `json:"tag" binding:"required,min=2,max=5"`
	Description string `json:"description" binding:"max=500"`
}

type CollectResult struct {
	Collected      map[models.ResourceType]int64 `json:"collected"`
	TotalResources map[models.ResourceType]int64 `json:"total_resources"`
}