package service

import (
	"context"
	"errors"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

// RoleService orchestrates role and permission assignment use-cases.
type RoleService struct {
	roleRepo repository.RoleRepository
}

// NewRoleService constructs a new RoleService instance.
func NewRoleService(roleRepo repository.RoleRepository) *RoleService {
	return &RoleService{roleRepo: roleRepo}
}

// GetByID returns a role and its associated permissions.
func (s *RoleService) GetByID(ctx context.Context, id int64) (*dto.RoleViewDTO, error) {
	role, err := s.roleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	view := toRoleViewDTO(role)
	return &view, nil
}

// List returns all active roles and their permissions.
func (s *RoleService) List(ctx context.Context) ([]dto.RoleViewDTO, error) {
	roles, err := s.roleRepo.List(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.RoleViewDTO, len(roles))
	for i, r := range roles {
		views[i] = toRoleViewDTO(r)
	}
	return views, nil
}

// Create creates a new role with assigned permissions.
func (s *RoleService) Create(ctx context.Context, input dto.CreateRoleDTO) (*dto.RoleViewDTO, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("role name is required")
	}

	role, err := s.roleRepo.Create(ctx, input.Name, input.Permissions)
	if err != nil {
		return nil, err
	}

	view := toRoleViewDTO(role)
	return &view, nil
}

// Update modifies a role's name and its assigned permissions.
func (s *RoleService) Update(ctx context.Context, id int64, input dto.UpdateRoleDTO) (*dto.RoleViewDTO, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("role name is required")
	}

	role, err := s.roleRepo.Update(ctx, id, input.Name, input.Permissions)
	if err != nil {
		return nil, err
	}

	view := toRoleViewDTO(role)
	return &view, nil
}

// Delete removes a role.
func (s *RoleService) Delete(ctx context.Context, id int64) error {
	return s.roleRepo.Delete(ctx, id)
}

// ListPermissions returns all available system permissions.
func (s *RoleService) ListPermissions(ctx context.Context) ([]dto.PermissionViewDTO, error) {
	perms, err := s.roleRepo.ListPermissions(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.PermissionViewDTO, len(perms))
	for i, p := range perms {
		views[i] = dto.PermissionViewDTO{
			ID:   p.ID,
			Name: p.Name,
		}
	}
	return views, nil
}

func toRoleViewDTO(r *entity.Role) dto.RoleViewDTO {
	perms := make([]dto.PermissionViewDTO, len(r.Permissions))
	for i, p := range r.Permissions {
		perms[i] = dto.PermissionViewDTO{
			ID:   p.ID,
			Name: p.Name,
		}
	}
	return dto.RoleViewDTO{
		ID:          r.ID,
		Name:        r.Name,
		Permissions: perms,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}
