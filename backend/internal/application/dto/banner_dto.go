package dto

import "time"

type CreateBannerDTO struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Badge    string `json:"badge"`
	ImageURL string `json:"image_url"`
	LinkURL  string `json:"link_url"`
	CtaText  string `json:"cta_text"`
	CtaLink  string `json:"cta_link"`
	Type     string `json:"type"`
	Position int32  `json:"position"`
	IsActive bool   `json:"is_active"`
}

type UpdateBannerDTO struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Badge    string `json:"badge"`
	ImageURL string `json:"image_url"`
	LinkURL  string `json:"link_url"`
	CtaText  string `json:"cta_text"`
	CtaLink  string `json:"cta_link"`
	Type     string `json:"type"`
	Position int32  `json:"position"`
	IsActive bool   `json:"is_active"`
}

type BannerViewDTO struct {
	ID        int64     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Title     string    `json:"title"`
	Subtitle  string    `json:"subtitle,omitempty"`
	Badge     string    `json:"badge,omitempty"`
	ImageURL  string    `json:"image_url"`
	LinkURL   string    `json:"link_url"`
	CtaText   string    `json:"cta_text,omitempty"`
	CtaLink   string    `json:"cta_link,omitempty"`
	Type      string    `json:"type"`
	Position  int32     `json:"position"`
	IsActive  bool      `json:"is_active"`
}
