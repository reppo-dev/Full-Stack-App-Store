package entity

import "time"

// Favorite represents a customer's wishlisted product.
type Favorite struct {
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
