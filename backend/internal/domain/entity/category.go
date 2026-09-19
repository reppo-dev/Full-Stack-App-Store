package entity

import "time"

// Category represents a hierarchical product catalog taxonomy node.
type Category struct {
	ID        int64      `json:"id"`
	Name      string     `json:"name"`
	Slug      string     `json:"slug"`
	ParentID  *int64     `json:"parent_id,omitempty"`
	Children  []Category `json:"children,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// IsRoot returns true if the category is a top-level parent node.
func (c *Category) IsRoot() bool {
	return c.ParentID == nil || *c.ParentID == 0
}
