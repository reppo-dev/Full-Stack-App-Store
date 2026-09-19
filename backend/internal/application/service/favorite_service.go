package service

import (
	"context"
	"errors"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

// FavoriteService orchestrates customer wishlist management without IDOR exposure.
type FavoriteService struct {
	favoriteRepo repository.FavoriteRepository
}

// NewFavoriteService constructs a new FavoriteService instance.
func NewFavoriteService(favoriteRepo repository.FavoriteRepository) *FavoriteService {
	return &FavoriteService{favoriteRepo: favoriteRepo}
}

// List retrieves all wishlisted products for the specified user.
func (s *FavoriteService) List(ctx context.Context, userID int64) ([]dto.FavoriteViewDTO, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	favorites, err := s.favoriteRepo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	views := make([]dto.FavoriteViewDTO, len(favorites))
	for i, f := range favorites {
		views[i] = toFavoriteViewDTO(f)
	}

	return views, nil
}

// Add appends a product to the user's wishlist.
func (s *FavoriteService) Add(ctx context.Context, userID, productID int64) (*dto.FavoriteViewDTO, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}
	if productID <= 0 {
		return nil, errors.New("invalid product ID")
	}

	fav, err := s.favoriteRepo.Add(ctx, userID, productID)
	if err != nil {
		return nil, err
	}

	view := toFavoriteViewDTO(fav)
	return &view, nil
}

// Remove removes a product from the user's wishlist.
func (s *FavoriteService) Remove(ctx context.Context, userID, productID int64) error {
	if userID <= 0 {
		return errors.New("invalid user ID")
	}
	if productID <= 0 {
		return errors.New("invalid product ID")
	}

	return s.favoriteRepo.Remove(ctx, userID, productID)
}

// IsFavorite checks whether the user has wishlisted a product.
func (s *FavoriteService) IsFavorite(ctx context.Context, userID, productID int64) (bool, error) {
	if userID <= 0 || productID <= 0 {
		return false, nil
	}

	return s.favoriteRepo.IsFavorite(ctx, userID, productID)
}

func toFavoriteViewDTO(f *entity.Favorite) dto.FavoriteViewDTO {
	return dto.FavoriteViewDTO{
		ID:            f.ID,
		UserID:        f.UserID,
		ProductID:     f.ProductID,
		ProductTitle:  f.ProductTitle,
		ProductSlug:   f.ProductSlug,
		ProductPrice:  f.ProductPrice,
		ProductImages: f.ProductImages,
		ProductStock:  f.ProductStock,
		ProductRating: f.ProductRating,
		CreatedAt:     f.CreatedAt,
	}
}
