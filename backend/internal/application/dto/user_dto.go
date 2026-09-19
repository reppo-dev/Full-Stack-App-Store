package dto

import "time"

// UserViewDTO represents the safe public projection of a User entity (no password hash).
type UserViewDTO struct {
	ID          int64      `json:"id"`
	FirstName   string     `json:"first_name"`
	LastName    string     `json:"last_name"`
	Image       string     `json:"image"`
	UserName    string     `json:"user_name"`
	PhoneNumber string     `json:"phone_number"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Email       string     `json:"email"`
	RoleID      int64      `json:"role_id"`
	RoleName    string     `json:"role,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// CreateUserDTO represents administrative input for creating a user.
type CreateUserDTO struct {
	FirstName   string     `json:"first_name"`
	LastName    string     `json:"last_name"`
	Image       string     `json:"image"`
	UserName    string     `json:"user_name"`
	PhoneNumber string     `json:"phone_number"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Email       string     `json:"email"`
	Password    string     `json:"password"`
	RoleID      int64      `json:"role_id"`
}

// UpdateUserDTO represents administrative input for updating user details.
type UpdateUserDTO struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Image       string `json:"image"`
	UserName    string `json:"user_name"`
	PhoneNumber string `json:"phone_number"`
	Email       string `json:"email"`
	RoleID      int64  `json:"role_id"`
}

// UpdateProfileDTO represents self-service profile modification.
type UpdateProfileDTO struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Image       string `json:"image"`
	PhoneNumber string `json:"phone_number"`
	Email       string `json:"email"`
}

// UserPaginationDTO represents paginated user list results.
type UserPaginationDTO struct {
	Data     []UserViewDTO `json:"data"`
	Total    int64         `json:"total"`
	Page     int32         `json:"page"`
	LastPage int32         `json:"last_page"`
}
