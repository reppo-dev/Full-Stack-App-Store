package repository

import (
	"context"
	"encoding/json"
	"math/big"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

// FavoriteRepositorySQLC implements repository.FavoriteRepository using SQLC.
type FavoriteRepositorySQLC struct {
	querier sqlc.Querier
}

// NewFavoriteRepositorySQLC constructs a new FavoriteRepositorySQLC instance.
func NewFavoriteRepositorySQLC(querier sqlc.Querier) *FavoriteRepositorySQLC {
	return &FavoriteRepositorySQLC{querier: querier}
}

// ListByUserID retrieves all wishlisted products for a given user.
func (r *FavoriteRepositorySQLC) ListByUserID(ctx context.Context, userID int64) ([]*entity.Favorite, error) {
	rows, err := r.querier.ListFavoritesByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	favorites := make([]*entity.Favorite, len(rows))
	for i, row := range rows {
		var images []string
		if len(row.ProductImages) > 0 {
			_ = json.Unmarshal(row.ProductImages, &images)
		}

		price, _ := row.ProductPrice.Float64Value()

		favorites[i] = &entity.Favorite{
			ID:            row.ID,
			UserID:        row.UserID,
			ProductID:     row.ProductID,
			ProductTitle:  row.ProductTitle,
			ProductSlug:   row.ProductSlug.String,
			ProductPrice:  price.Float64,
			ProductImages: images,
			ProductStock:  row.ProductStock.Int32,
			ProductRating: row.ProductRating.Float64,
			CreatedAt:     row.CreatedAt.Time,
		}
	}

	return favorites, nil
}

// IsFavorite checks whether a product is currently in the user's wishlist.
func (r *FavoriteRepositorySQLC) IsFavorite(ctx context.Context, userID, productID int64) (bool, error) {
	return r.querier.IsFavorite(ctx, sqlc.IsFavoriteParams{
		UserID:    userID,
		ProductID: productID,
	})
}

// Add inserts or reactivates a product in the user's wishlist.
func (r *FavoriteRepositorySQLC) Add(ctx context.Context, userID, productID int64) (*entity.Favorite, error) {
	row, err := r.querier.AddFavorite(ctx, sqlc.AddFavoriteParams{
		UserID:    userID,
		ProductID: productID,
	})
	if err != nil {
		return nil, err
	}

	return &entity.Favorite{
		ID:        row.ID,
		UserID:    row.UserID,
		ProductID: row.ProductID,
		CreatedAt: row.CreatedAt.Time,
	}, nil
}

// Remove deletes a product from the user's wishlist.
func (r *FavoriteRepositorySQLC) Remove(ctx context.Context, userID, productID int64) error {
	return r.querier.RemoveFavorite(ctx, sqlc.RemoveFavoriteParams{
		UserID:    userID,
		ProductID: productID,
	})
}

func numericToFloatVal(n pgtype.Numeric) float64 {
	if !n.Valid {
		return 0.0
	}
	f, _ := n.Float64Value()
	if f.Valid {
		return f.Float64
	}
	if n.Int != nil {
		bf := new(big.Float).SetInt(n.Int)
		if n.Exp != 0 {
			multiplier := new(big.Float).SetFloat64(1.0)
			for i := int32(0); i < -n.Exp; i++ {
				multiplier.Quo(multiplier, big.NewFloat(10))
			}
			bf.Mul(bf, multiplier)
		}
		res, _ := bf.Float64()
		return res
	}
	return 0.0
}
