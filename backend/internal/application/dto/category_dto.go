package dto

import "time"

// CategoryViewDTO represents the public projection of a Category entity.
type CategoryViewDTO struct {
	ID        int64             `json:"id"`
	Name      string            `json:"name"`
	Slug      string            `json:"slug"`
	ParentID  *int64            `json:"parent_id,omitempty"`
	Children  []CategoryViewDTO `json:"children,omitempty"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}

// CreateCategoryDTO represents input data for creating a category.
type CreateCategoryDTO struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentID *int64 `json:"parent_id,omitempty"`
}

// UpdateCategoryDTO represents input data for modifying an existing category.
type UpdateCategoryDTO struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentID *int64 `json:"parent_id,omitempty"`
}
