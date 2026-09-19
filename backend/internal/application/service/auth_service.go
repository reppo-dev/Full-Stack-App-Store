package service

import (
	"context"
	"errors"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/security"
)

// AuthService orchestrates authentication, registration, and credential use-cases.
type AuthService struct {
	userRepo     repository.UserRepository
	hasher       security.PasswordHasher
	tokenManager security.TokenManager
}

// NewAuthService constructs a new AuthService instance.
func NewAuthService(
	userRepo repository.UserRepository,
	hasher security.PasswordHasher,
	tokenManager security.TokenManager,
) *AuthService {
	return &AuthService{
		userRepo:     userRepo,
		hasher:       hasher,
		tokenManager: tokenManager,
	}
}

// Register creates a new user account and returns an authenticated session.
func (s *AuthService) Register(ctx context.Context, input dto.RegisterRequestDTO) (*dto.AuthResponseDTO, error) {
	if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" || strings.TrimSpace(input.UserName) == "" {
		return nil, errors.New("username, email, and password are required")
	}

	if input.Password != input.PasswordConfirm {
		return nil, domain.ErrPasswordMismatch
	}

	// Verify uniqueness
	if existing, err := s.userRepo.GetByEmail(ctx, input.Email); err == nil && existing != nil {
		return nil, domain.ErrEmailAlreadyExists
	}
	if existing, err := s.userRepo.GetByUsername(ctx, input.UserName); err == nil && existing != nil {
		return nil, domain.ErrUsernameAlreadyExists
	}

	hashedPassword, err := s.hasher.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	user := &entity.User{
		FirstName:   input.FirstName,
		LastName:    input.LastName,
		Image:       input.Image,
		UserName:    input.UserName,
		PhoneNumber: input.PhoneNumber,
		DateOfBirth: input.DateOfBirth,
		Email:       input.Email,
		Password:    hashedPassword,
		RoleID:      1, // default customer role
		RoleName:    "customer",
	}

	created, err := s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	token, err := s.tokenManager.GenerateToken(created.ID, created.Email, "customer")
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponseDTO{
		Token: token,
		User:  toUserViewDTO(created),
	}, nil
}

// Login verifies credentials and issues an authenticated session token.
func (s *AuthService) Login(ctx context.Context, input dto.LoginRequestDTO) (*dto.AuthResponseDTO, error) {
	if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" {
		return nil, domain.ErrInvalidCredentials
	}

	user, err := s.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return nil, domain.ErrInvalidCredentials
		}
		return nil, err
	}

	if err := s.hasher.ComparePassword(user.Password, input.Password); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	roleName := user.RoleName
	if roleName == "" {
		roleName = "customer"
	}

	token, err := s.tokenManager.GenerateToken(user.ID, user.Email, roleName)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponseDTO{
		Token: token,
		User:  toUserViewDTO(user),
	}, nil
}

// GetUserByID retrieves the public profile for a specific user ID.
func (s *AuthService) GetUserByID(ctx context.Context, id int64) (*dto.UserViewDTO, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	view := toUserViewDTO(user)
	return &view, nil
}

// UpdatePassword modifies a user's password after verifying confirmation.
func (s *AuthService) UpdatePassword(ctx context.Context, id int64, input dto.UpdatePasswordDTO) error {
	if input.Password == "" || input.Password != input.PasswordConfirm {
		return domain.ErrPasswordMismatch
	}

	hashed, err := s.hasher.HashPassword(input.Password)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(ctx, id, hashed)
}

// ValidateToken validates a token string and extracts session claims.
func (s *AuthService) ValidateToken(tokenStr string) (*security.UserClaims, error) {
	return s.tokenManager.ValidateToken(tokenStr)
}

func toUserViewDTO(u *entity.User) dto.UserViewDTO {
	return dto.UserViewDTO{
		ID:          u.ID,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		Image:       u.Image,
		UserName:    u.UserName,
		PhoneNumber: u.PhoneNumber,
		DateOfBirth: u.DateOfBirth,
		Email:       u.Email,
		RoleID:      u.RoleID,
		RoleName:    u.RoleName,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}
