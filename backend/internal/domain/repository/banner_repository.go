package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

type BannerRepository interface {
	ListActiveByType(ctx context.Context, bannerType string) ([]*entity.Banner, error)
	ListAll(ctx context.Context) ([]*entity.Banner, error)
	GetByID(ctx context.Context, id int64) (*entity.Banner, error)
	Create(ctx context.Context, banner *entity.Banner) (*entity.Banner, error)
	Update(ctx context.Context, banner *entity.Banner) (*entity.Banner, error)
	Delete(ctx context.Context, id int64) error
}
