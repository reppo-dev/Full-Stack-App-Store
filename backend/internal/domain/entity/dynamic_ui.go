package entity

import "time"

type Brand struct {
	ID        int64      `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	Name      string     `json:"name"`
	Category  *string    `json:"category,omitempty"`
	Href      *string    `json:"href,omitempty"`
	IsActive  bool       `json:"is_active"`
}

type Story struct {
	ID            int64     `json:"id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Title         string    `json:"title"`
	Subtitle      *string   `json:"subtitle,omitempty"`
	Badge         *string   `json:"badge,omitempty"`
	Category      *string   `json:"category,omitempty"`
	ImageURL      string    `json:"image_url"`
	LinkURL       *string   `json:"link_url,omitempty"`
	ButtonText    *string   `json:"button_text,omitempty"`
	GradientClass *string   `json:"gradient_class,omitempty"`
	IconName      *string   `json:"icon_name,omitempty"`
	FeaturedPrice *string   `json:"featured_price,omitempty"`
	IsActive      bool      `json:"is_active"`
}
