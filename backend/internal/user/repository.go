package user

import (
	"context"
	"database/sql"
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

// GetByID retrieves user by ID
func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, telegram_id, username, first_name, last_name, photo_url, 
		       wallet_address, level, experience, guild_id, district_id,
		       created_at, updated_at, last_active_at
		FROM users 
		WHERE id = $1`
	
	err := r.db.GetContext(ctx, &user, query, id)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return &user, err
}

// GetByTelegramID retrieves user by Telegram ID
func (r *Repository) GetByTelegramID(ctx context.Context, telegramID int64) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, telegram_id, username, first_name, last_name, photo_url, 
		       wallet_address, level, experience, guild_id, district_id,
		       created_at, updated_at, last_active_at
		FROM users 
		WHERE telegram_id = $1`
	
	err := r.db.GetContext(ctx, &user, query, telegramID)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return &user, err
}

// GetByUsername retrieves user by username
func (r *Repository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, telegram_id, username, first_name, last_name, photo_url, 
		       wallet_address, level, experience, guild_id, district_id,
		       created_at, updated_at, last_active_at
		FROM users 
		WHERE username = $1`
	
	err := r.db.GetContext(ctx, &user, query, username)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return &user, err
}

// Update updates user information
func (r *Repository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users 
		SET username = $1, first_name = $2, last_name = $3, photo_url = $4,
		    wallet_address = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6`
	
	_, err := r.db.ExecContext(ctx, query,
		user.Username, user.FirstName, user.LastName, user.PhotoURL,
		user.WalletAddress, user.ID)
	
	return err
}

// UpdateWallet updates user's wallet address
func (r *Repository) UpdateWallet(ctx context.Context, userID uuid.UUID, walletAddress string) error {
	query := `
		UPDATE users 
		SET wallet_address = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2`
	
	_, err := r.db.ExecContext(ctx, query, walletAddress, userID)
	return err
}

// GetStats retrieves user statistics
func (r *Repository) GetStats(ctx context.Context, userID uuid.UUID) (*models.UserStats, error) {
	var stats models.UserStats
	query := `
		SELECT user_id, total_buildings, total_battles, battles_won, 
		       resources_gathered, play_time
		FROM user_stats 
		WHERE user_id = $1`
	
	err := r.db.GetContext(ctx, &stats, query, userID)
	if err == sql.ErrNoRows {
		// Create default stats if not exists
		stats = models.UserStats{
			UserID: userID,
		}
		_, err = r.db.ExecContext(ctx,
			`INSERT INTO user_stats (user_id) VALUES ($1)`, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to create user stats: %w", err)
		}
	}
	
	return &stats, nil
}

// UpdateStats updates user statistics
func (r *Repository) UpdateStats(ctx context.Context, stats *models.UserStats) error {
	query := `
		UPDATE user_stats 
		SET total_buildings = $1, total_battles = $2, battles_won = $3,
		    resources_gathered = $4, play_time = $5, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $6`
	
	_, err := r.db.ExecContext(ctx, query,
		stats.TotalBuildings, stats.TotalBattles, stats.BattlesWon,
		stats.ResourcesGathered, stats.PlayTime, stats.UserID)
	
	return err
}

// GetLeaderboard retrieves top users by level
func (r *Repository) GetLeaderboard(ctx context.Context, limit int) ([]*models.User, error) {
	var users []*models.User
	query := `
		SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name, 
		       u.photo_url, u.level, u.experience, g.name as guild_name
		FROM users u
		LEFT JOIN guilds g ON u.guild_id = g.id
		ORDER BY u.level DESC, u.experience DESC
		LIMIT $1`
	
	err := r.db.SelectContext(ctx, &users, query, limit)
	return users, err
}

// SearchUsers searches users by username or name
func (r *Repository) SearchUsers(ctx context.Context, query string, limit int) ([]*models.User, error) {
	var users []*models.User
	searchQuery := `
		SELECT id, telegram_id, username, first_name, last_name, photo_url, 
		       level, experience, guild_id
		FROM users 
		WHERE username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1
		ORDER BY level DESC, experience DESC
		LIMIT $2`
	
	searchPattern := "%" + query + "%"
	err := r.db.SelectContext(ctx, &users, searchQuery, searchPattern, limit)
	return users, err
}

// GetGuildMembers retrieves all members of a guild
func (r *Repository) GetGuildMembers(ctx context.Context, guildID uuid.UUID) ([]*models.User, error) {
	var users []*models.User
	query := `
		SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name, 
		       u.photo_url, u.level, u.experience, gm.role
		FROM users u
		JOIN guild_members gm ON u.id = gm.user_id
		WHERE gm.guild_id = $1
		ORDER BY 
			CASE gm.role 
				WHEN 'emperor' THEN 1
				WHEN 'governor' THEN 2
				WHEN 'citizen' THEN 3
				WHEN 'vassal' THEN 4
			END,
			u.level DESC`
	
	err := r.db.SelectContext(ctx, &users, query, guildID)
	return users, err
}

// UpdateExperience updates user's experience and potentially level
func (r *Repository) UpdateExperience(ctx context.Context, userID uuid.UUID, expGain int64) error {
	// This could be enhanced with level calculation logic
	query := `
		UPDATE users 
		SET experience = experience + $1,
		    level = CASE 
		        WHEN experience + $1 >= level * 1000 THEN level + 1
		        ELSE level
		    END,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $2`
	
	_, err := r.db.ExecContext(ctx, query, expGain, userID)
	return err
}

// Transaction executes a function within a database transaction
func (r *Repository) Transaction(ctx context.Context, fn func(*sqlx.Tx) error) error {
	return r.db.Transaction(fn)
}