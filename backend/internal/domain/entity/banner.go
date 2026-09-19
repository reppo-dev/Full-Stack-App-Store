package entity

import "time"

type BannerType string

const (
	BannerTypeHero  BannerType = "hero"
	BannerTypePromo BannerType = "promo"
)

type Banner struct {
	ID        int64      `json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Title     string     `json:"title"`
	Subtitle  string     `json:"subtitle,omitempty"`
	Badge     string     `json:"badge,omitempty"`
	ImageURL  string     `json:"image_url"`
	LinkURL   string     `json:"link_url"`
	CtaText   string     `json:"cta_text,omitempty"`
	CtaLink   string     `json:"cta_link,omitempty"`
	Type      BannerType `json:"type"`
	Position  int32      `json:"position"`
	IsActive  bool       `json:"is_active"`
}
