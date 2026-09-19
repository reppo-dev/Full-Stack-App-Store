package dto

import "time"

// PermissionViewDTO represents public permission information.
type PermissionViewDTO struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// RoleViewDTO represents public role information with nested permissions.
type RoleViewDTO struct {
	ID          int64               `json:"id"`
	Name        string              `json:"name"`
	Permissions []PermissionViewDTO `json:"permissions"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

// CreateRoleDTO represents role creation payload.
type CreateRoleDTO struct {
	Name        string  `json:"name"`
	Permissions []int64 `json:"permissions"`
}

// UpdateRoleDTO represents role update payload.
type UpdateRoleDTO struct {
	Name        string  `json:"name"`
	Permissions []int64 `json:"permissions"`
}
