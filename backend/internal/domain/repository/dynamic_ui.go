package repository

import (
	"context"
	"github.com/reppo/go-backend/internal/domain/entity"
)

type DynamicUIRepository interface {
	ListBrands(ctx context.Context) ([]*entity.Brand, error)
	ListStories(ctx context.Context) ([]*entity.Story, error)
}
