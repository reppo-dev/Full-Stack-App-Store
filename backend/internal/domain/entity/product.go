package entity

import "time"

// Product represents a retail merchandise item in the catalog.
type Product struct {
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
	DeletedAt    *time.Time             `json:"deleted_at,omitempty"`
}

// InStock returns true if inventory quantity is strictly positive.
func (p *Product) InStock() bool {
	return p.Stock > 0
}
