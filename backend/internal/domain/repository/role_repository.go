package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// RoleRepository defines the persistence port for Role and Permission entities.
type RoleRepository interface {
	GetByID(ctx context.Context, id int64) (*entity.Role, error)
	GetByName(ctx context.Context, name string) (*entity.Role, error)
	List(ctx context.Context) ([]*entity.Role, error)
	Create(ctx context.Context, name string, permissionIDs []int64) (*entity.Role, error)
	Update(ctx context.Context, id int64, name string, permissionIDs []int64) (*entity.Role, error)
	Delete(ctx context.Context, id int64) error
	ListPermissions(ctx context.Context) ([]*entity.Permission, error)
}
