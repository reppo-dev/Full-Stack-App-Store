package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// CategoryRepository defines the persistence and caching contract for categories.
type CategoryRepository interface {
	GetByID(ctx context.Context, id int64) (*entity.Category, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Category, error)
	List(ctx context.Context) ([]*entity.Category, error)
	GetTree(ctx context.Context) ([]*entity.Category, error)
	Create(ctx context.Context, cat *entity.Category) (*entity.Category, error)
	Update(ctx context.Context, cat *entity.Category) (*entity.Category, error)
	Delete(ctx context.Context, id int64) error
}
