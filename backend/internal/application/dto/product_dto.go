package dto

import "time"

// ProductViewDTO represents the public projection of a Product entity.
type ProductViewDTO struct {
	ID           int64                  `json:"id"`
	Title        string                 `json:"title"`
	Slug         string                 `json:"slug"`
	Description  string                 `json:"description"`
	Price        float64                `json:"price"`
	Stock        int32                  `json:"stock"`
	Rating       float64                `json:"rating"`
	Images       []string               `json:"images"`
	Colors       []string               `json:"colors"`
	Attributes   map[string]interface{} `json:"attributes"`
	CategoryID   *int64                 `json:"category_id,omitempty"`
	CategoryName string                 `json:"category_name,omitempty"`
	SKU          string                 `json:"sku"`
	IsActive     bool                   `json:"is_active"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
}

// CreateProductDTO represents input payload for creating a product.
type CreateProductDTO struct {
	Title        string                 `json:"title"`
	Slug         string                 `json:"slug"`
	Description  string                 `json:"description"`
	Price        float64                `json:"price"`
	Stock        int32                  `json:"stock"`
	Rating       float64                `json:"rating"`
	Images       []string               `json:"images"`
	Colors       []string               `json:"colors"`
	Attributes   map[string]interface{} `json:"attributes"`
	CategoryID   *int64                 `json:"category_id,omitempty"`
	CategoryName string                 `json:"category_name,omitempty"`
	SKU          string                 `json:"sku"`
	IsActive     *bool                  `json:"is_active,omitempty"`
}

// UpdateProductDTO represents input payload for updating an existing product.
type UpdateProductDTO struct {
	Title       *string                 `json:"title,omitempty"`
	Slug        *string                 `json:"slug,omitempty"`
	Description *string                 `json:"description,omitempty"`
	Price       *float64                `json:"price,omitempty"`
	Stock       *int32                  `json:"stock,omitempty"`
	Rating      *float64                `json:"rating,omitempty"`
	Images      []string                `json:"images,omitempty"`
	Colors      []string                `json:"colors,omitempty"`
	Attributes  map[string]interface{}  `json:"attributes,omitempty"`
	CategoryID  *int64                  `json:"category_id,omitempty"`
	SKU         *string                 `json:"sku,omitempty"`
	IsActive    *bool                   `json:"is_active,omitempty"`
}

// ProductPaginationDTO represents paginated product list results.
type ProductPaginationDTO struct {
	Data     []ProductViewDTO `json:"data"`
	Total    int64            `json:"total"`
	Page     int32            `json:"page"`
	LastPage int32            `json:"last_page"`
}
