package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ton-empire/backend/internal/common/config"
	"github.com/ton-empire/backend/internal/common/database"
	"github.com/ton-empire/backend/pkg/logger"
	"github.com/ton-empire/backend/pkg/models"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db     *database.DB
	config *config.Config
}

func NewService(db *database.DB, cfg *config.Config) *Service {
	return &Service{
		db:     db,
		config: cfg,
	}
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int          `json:"expires_in"`
	User         *models.User `json:"user"`
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

func (s *Service) AuthenticateWithTelegram(ctx context.Context, initData string) (*AuthResponse, error) {
	authData, err := ValidateTelegramAuth(initData, s.config.Telegram.BotToken)
	if err != nil {
		return nil, fmt.Errorf("invalid telegram auth: %w", err)
	}

	if authData.User == nil {
		return nil, fmt.Errorf("user data is missing")
	}

	user, err := s.findOrCreateUser(ctx, authData.User)
	if err != nil {
		return nil, fmt.Errorf("failed to process user: %w", err)
	}

	accessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	session := &models.UserSession{
		ID:           uuid.New(),
		UserID:       user.ID,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(s.config.JWT.RefreshTokenTTL),
		CreatedAt:    time.Now(),
	}

	if err := s.createSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	if err := s.updateLastActive(ctx, user.ID); err != nil {
		logger.Errorf("Failed to update last active time: %v", err)
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(s.config.JWT.AccessTokenTTL.Seconds()),
		User:         user,
	}, nil
}

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error) {
	session, err := s.findSessionByRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("refresh token expired")
	}

	user, err := s.getUserByID(ctx, session.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	accessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	newRefreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	session.RefreshToken = newRefreshToken
	session.ExpiresAt = time.Now().Add(s.config.JWT.RefreshTokenTTL)
	
	if err := s.updateSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    int(s.config.JWT.AccessTokenTTL.Seconds()),
		User:         user,
	}, nil
}

func (s *Service) Logout(ctx context.Context, userID uuid.UUID, refreshToken string) error {
	return s.deleteSession(ctx, userID, refreshToken)
}

func (s *Service) findOrCreateUser(ctx context.Context, tgUser *TelegramUser) (*models.User, error) {
	var user models.User
	
	err := s.db.GetContext(ctx, &user, 
		"SELECT * FROM users WHERE telegram_id = $1", tgUser.ID)
	
	if err == nil {
		needUpdate := false
		if user.Username != tgUser.Username {
			user.Username = tgUser.Username
			needUpdate = true
		}
		if user.FirstName != tgUser.FirstName {
			user.FirstName = tgUser.FirstName
			needUpdate = true
		}
		if user.LastName != tgUser.LastName {
			user.LastName = tgUser.LastName
			needUpdate = true
		}
		if user.PhotoURL != tgUser.PhotoURL {
			user.PhotoURL = tgUser.PhotoURL
			needUpdate = true
		}

		if needUpdate {
			_, err = s.db.ExecContext(ctx,
				`UPDATE users SET username = $1, first_name = $2, last_name = $3, photo_url = $4, updated_at = CURRENT_TIMESTAMP
				WHERE id = $5`,
				user.Username, user.FirstName, user.LastName, user.PhotoURL, user.ID)
			if err != nil {
				return nil, fmt.Errorf("failed to update user: %w", err)
			}
		}
		
		return &user, nil
	}

	user = models.User{
		ID:           uuid.New(),
		TelegramID:   tgUser.ID,
		Username:     tgUser.Username,
		FirstName:    tgUser.FirstName,
		LastName:     tgUser.LastName,
		PhotoURL:     tgUser.PhotoURL,
		Level:        1,
		Experience:   0,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		LastActiveAt: time.Now(),
	}

	if user.Username == "" {
		user.Username = fmt.Sprintf("user_%d", tgUser.ID)
	}

	_, err = s.db.ExecContext(ctx,
		`INSERT INTO users (id, telegram_id, username, first_name, last_name, photo_url, level, experience, created_at, updated_at, last_active_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		user.ID, user.TelegramID, user.Username, user.FirstName, user.LastName, user.PhotoURL,
		user.Level, user.Experience, user.CreatedAt, user.UpdatedAt, user.LastActiveAt)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	_, err = s.db.ExecContext(ctx,
		`INSERT INTO user_stats (user_id) VALUES ($1)`, user.ID)
	
	if err != nil {
		logger.Errorf("Failed to create user stats: %v", err)
	}

	return &user, nil
}

func (s *Service) generateAccessToken(userID uuid.UUID) (string, error) {
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.JWT.AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ton-empire",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWT.Secret))
}

func (s *Service) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if err := bcrypt.GenerateFromPassword(b, bcrypt.DefaultCost); err != nil {
		return "", err
	}
	return uuid.New().String() + "-" + string(b), nil
}

func (s *Service) createSession(ctx context.Context, session *models.UserSession) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO user_sessions (id, user_id, refresh_token, user_agent, ip, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		session.ID, session.UserID, session.RefreshToken, session.UserAgent, session.IP,
		session.ExpiresAt, session.CreatedAt)
	return err
}

func (s *Service) updateSession(ctx context.Context, session *models.UserSession) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE user_sessions SET refresh_token = $1, expires_at = $2 WHERE id = $3`,
		session.RefreshToken, session.ExpiresAt, session.ID)
	return err
}

func (s *Service) findSessionByRefreshToken(ctx context.Context, refreshToken string) (*models.UserSession, error) {
	var session models.UserSession
	err := s.db.GetContext(ctx, &session,
		`SELECT * FROM user_sessions WHERE refresh_token = $1`, refreshToken)
	return &session, err
}

func (s *Service) deleteSession(ctx context.Context, userID uuid.UUID, refreshToken string) error {
	_, err := s.db.ExecContext(ctx,
		`DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token = $2`,
		userID, refreshToken)
	return err
}

func (s *Service) getUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	var user models.User
	err := s.db.GetContext(ctx, &user, `SELECT * FROM users WHERE id = $1`, userID)
	return &user, err
}

func (s *Service) updateLastActive(ctx context.Context, userID uuid.UUID) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1`, userID)
	return err
}