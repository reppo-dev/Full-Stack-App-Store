package service

import (
	"context"
	"math"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/security"
)

// UserService orchestrates user querying, administrative creation, modification, and deletion.
type UserService struct {
	userRepo repository.UserRepository
	hasher   security.PasswordHasher
}

// NewUserService constructs a new UserService instance.
func NewUserService(userRepo repository.UserRepository, hasher security.PasswordHasher) *UserService {
	return &UserService{
		userRepo: userRepo,
		hasher:   hasher,
	}
}

// GetByID returns the public view of a user by primary key ID.
func (s *UserService) GetByID(ctx context.Context, id int64) (*dto.UserViewDTO, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	view := toUserViewDTO(user)
	return &view, nil
}

// List returns a paginated list of users.
func (s *UserService) List(ctx context.Context, page, pageSize int32) (*dto.UserPaginationDTO, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 15
	}

	offset := (page - 1) * pageSize
	users, err := s.userRepo.List(ctx, pageSize, offset)
	if err != nil {
		return nil, err
	}

	total, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	lastPage := int32(math.Ceil(float64(total) / float64(pageSize)))
	if lastPage < 1 {
		lastPage = 1
	}

	views := make([]dto.UserViewDTO, len(users))
	for i, u := range users {
		views[i] = toUserViewDTO(u)
	}

	return &dto.UserPaginationDTO{
		Data:     views,
		Total:    total,
		Page:     page,
		LastPage: lastPage,
	}, nil
}

// ListAll returns all active users without pagination.
func (s *UserService) ListAll(ctx context.Context) ([]dto.UserViewDTO, error) {
	users, err := s.userRepo.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.UserViewDTO, len(users))
	for i, u := range users {
		views[i] = toUserViewDTO(u)
	}
	return views, nil
}

// Create creates a new user through administrative actions.
func (s *UserService) Create(ctx context.Context, input dto.CreateUserDTO) (*dto.UserViewDTO, error) {
	hashedPassword, err := s.hasher.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	roleID := input.RoleID
	if roleID <= 0 {
		roleID = 1
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
		RoleID:      roleID,
	}

	created, err := s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, err
	}

	view := toUserViewDTO(created)
	return &view, nil
}

// Update updates administrative fields on a user record.
func (s *UserService) Update(ctx context.Context, id int64, input dto.UpdateUserDTO) (*dto.UserViewDTO, error) {
	user := &entity.User{
		ID:          id,
		FirstName:   input.FirstName,
		LastName:    input.LastName,
		Image:       input.Image,
		UserName:    input.UserName,
		PhoneNumber: input.PhoneNumber,
		Email:       input.Email,
		RoleID:      input.RoleID,
	}

	updated, err := s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, err
	}

	view := toUserViewDTO(updated)
	return &view, nil
}

// UpdateProfile updates self-service fields on a user's own profile.
func (s *UserService) UpdateProfile(ctx context.Context, id int64, input dto.UpdateProfileDTO) (*dto.UserViewDTO, error) {
	user := &entity.User{
		ID:          id,
		FirstName:   input.FirstName,
		LastName:    input.LastName,
		Image:       input.Image,
		PhoneNumber: input.PhoneNumber,
		Email:       input.Email,
	}

	updated, err := s.userRepo.UpdateProfile(ctx, user)
	if err != nil {
		return nil, err
	}

	view := toUserViewDTO(updated)
	return &view, nil
}

// Delete marks a user as deleted.
func (s *UserService) Delete(ctx context.Context, id int64) error {
	return s.userRepo.Delete(ctx, id)
}
