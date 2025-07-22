package user

import (
	"context"
	"fmt"
	"strings"

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

// GetUser retrieves user by ID
func (s *Service) GetUser(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

// GetUserByUsername retrieves user by username
func (s *Service) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	user, err := s.repo.GetByUsername(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}
	return user, nil
}

// UpdateUser updates user profile information
func (s *Service) UpdateUser(ctx context.Context, userID uuid.UUID, update UpdateUserRequest) (*models.User, error) {
	// Get current user
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Validate and update fields
	if update.Username != nil {
		username := strings.TrimSpace(*update.Username)
		if len(username) < 3 || len(username) > 20 {
			return nil, fmt.Errorf("username must be between 3 and 20 characters")
		}
		// Check if username is already taken
		existing, _ := s.repo.GetByUsername(ctx, username)
		if existing != nil && existing.ID != userID {
			return nil, fmt.Errorf("username already taken")
		}
		user.Username = username
	}

	if update.FirstName != nil {
		user.FirstName = strings.TrimSpace(*update.FirstName)
	}

	if update.LastName != nil {
		user.LastName = strings.TrimSpace(*update.LastName)
	}

	if update.PhotoURL != nil {
		user.PhotoURL = strings.TrimSpace(*update.PhotoURL)
	}

	// Update in database
	if err := s.repo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// ConnectWallet connects a TON wallet to user account
func (s *Service) ConnectWallet(ctx context.Context, userID uuid.UUID, walletAddress string) error {
	// Validate wallet address format (basic validation)
	walletAddress = strings.TrimSpace(walletAddress)
	if len(walletAddress) < 48 || len(walletAddress) > 48 {
		return fmt.Errorf("invalid wallet address format")
	}

	// Update wallet address
	if err := s.repo.UpdateWallet(ctx, userID, walletAddress); err != nil {
		return fmt.Errorf("failed to connect wallet: %w", err)
	}

	logger.Infof("Wallet connected for user %s: %s", userID, walletAddress)
	return nil
}

// GetUserStats retrieves user statistics
func (s *Service) GetUserStats(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	stats, err := s.repo.GetStats(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user stats: %w", err)
	}
	return stats, nil
}

// GetLeaderboard retrieves top users
func (s *Service) GetLeaderboard(ctx context.Context, limit int) ([]*LeaderboardEntry, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	users, err := s.repo.GetLeaderboard(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get leaderboard: %w", err)
	}

	entries := make([]*LeaderboardEntry, len(users))
	for i, user := range users {
		entries[i] = &LeaderboardEntry{
			Rank:       i + 1,
			User:       user,
			GuildName:  "", // This would be populated from JOIN
		}
	}

	return entries, nil
}

// SearchUsers searches for users by query
func (s *Service) SearchUsers(ctx context.Context, query string, limit int) ([]*models.User, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	query = strings.TrimSpace(query)
	if len(query) < 2 {
		return nil, fmt.Errorf("search query must be at least 2 characters")
	}

	users, err := s.repo.SearchUsers(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}

	return users, nil
}

// AddExperience adds experience to user and handles level up
func (s *Service) AddExperience(ctx context.Context, userID uuid.UUID, amount int64) (*LevelUpResult, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("experience amount must be positive")
	}

	// Get current user
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	oldLevel := user.Level
	
	// Update experience
	if err := s.repo.UpdateExperience(ctx, userID, amount); err != nil {
		return nil, fmt.Errorf("failed to add experience: %w", err)
	}

	// Get updated user
	updatedUser, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := &LevelUpResult{
		NewExperience: updatedUser.Experience,
		NewLevel:      updatedUser.Level,
		LeveledUp:     updatedUser.Level > oldLevel,
	}

	if result.LeveledUp {
		logger.Infof("User %s leveled up to level %d", userID, updatedUser.Level)
		// Here you could trigger level up rewards, notifications, etc.
	}

	return result, nil
}

// GetGuildMembers retrieves all members of a user's guild
func (s *Service) GetGuildMembers(ctx context.Context, userID uuid.UUID) ([]*models.User, error) {
	// Get user to find their guild
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if user.GuildID == nil {
		return nil, fmt.Errorf("user is not in a guild")
	}

	members, err := s.repo.GetGuildMembers(ctx, *user.GuildID)
	if err != nil {
		return nil, fmt.Errorf("failed to get guild members: %w", err)
	}

	return members, nil
}

// Types for service methods

type UpdateUserRequest struct {
	Username  *string `json:"username,omitempty"`
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	PhotoURL  *string `json:"photo_url,omitempty"`
}

type LeaderboardEntry struct {
	Rank      int          `json:"rank"`
	User      *models.User `json:"user"`
	GuildName string       `json:"guild_name,omitempty"`
}

type LevelUpResult struct {
	NewExperience int64 `json:"new_experience"`
	NewLevel      int   `json:"new_level"`
	LeveledUp     bool  `json:"leveled_up"`
}