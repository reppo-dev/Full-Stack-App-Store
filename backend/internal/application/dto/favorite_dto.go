package dto

import "time"

// AddFavoriteDTO represents input payload for adding a product to wishlist.
type AddFavoriteDTO struct {
	ProductID int64 `json:"product_id"`
}

// FavoriteViewDTO represents serialized wishlist item with denormalized product details.
type FavoriteViewDTO struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	ProductID     int64     `json:"product_id"`
	ProductTitle  string    `json:"product_title,omitempty"`
	ProductSlug   string    `json:"product_slug,omitempty"`
	ProductPrice  float64   `json:"product_price,omitempty"`
	ProductImages []string  `json:"product_images,omitempty"`
	ProductStock  int32     `json:"product_stock,omitempty"`
	ProductRating float64   `json:"product_rating,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}
