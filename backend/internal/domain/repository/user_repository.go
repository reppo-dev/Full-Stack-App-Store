package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// UserRepository defines the persistence port for the User entity.
type UserRepository interface {
	GetByID(ctx context.Context, id int64) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	GetByUsername(ctx context.Context, username string) (*entity.User, error)
	List(ctx context.Context, limit, offset int32) ([]*entity.User, error)
	ListAll(ctx context.Context) ([]*entity.User, error)
	Count(ctx context.Context) (int64, error)
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) (*entity.User, error)
	UpdateProfile(ctx context.Context, user *entity.User) (*entity.User, error)
	UpdatePassword(ctx context.Context, id int64, hashedPassword string) error
	Delete(ctx context.Context, id int64) error
}
