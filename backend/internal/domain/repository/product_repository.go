package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// ProductListParams defines search, filter, and pagination options for products.
type ProductListParams struct {
	Limit      int32
	Offset     int32
	CategoryID *int64
	IsActive   *bool
}

// ProductRepository defines the persistence and caching contract for catalog merchandise.
type ProductRepository interface {
	GetByID(ctx context.Context, id int64) (*entity.Product, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Product, error)
	List(ctx context.Context, params ProductListParams) ([]*entity.Product, error)
	ListAll(ctx context.Context) ([]*entity.Product, error)
	Count(ctx context.Context, params ProductListParams) (int64, error)
	Create(ctx context.Context, product *entity.Product) (*entity.Product, error)
	Update(ctx context.Context, product *entity.Product) (*entity.Product, error)
	UpdateStock(ctx context.Context, id int64, newStock int32) error
	Delete(ctx context.Context, id int64) error
}
