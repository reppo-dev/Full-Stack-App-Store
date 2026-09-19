package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// FavoriteRepository defines the persistence contract for customer wishlists.
type FavoriteRepository interface {
	ListByUserID(ctx context.Context, userID int64) ([]*entity.Favorite, error)
	IsFavorite(ctx context.Context, userID, productID int64) (bool, error)
	Add(ctx context.Context, userID, productID int64) (*entity.Favorite, error)
	Remove(ctx context.Context, userID, productID int64) error
}
