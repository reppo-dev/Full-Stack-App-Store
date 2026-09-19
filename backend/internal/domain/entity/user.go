package entity

import (
	"time"
)

// User represents the core identity domain entity.
type User struct {
	ID          int64      `json:"id"`
	FirstName   string     `json:"first_name"`
	LastName    string     `json:"last_name"`
	Image       string     `json:"image"`
	UserName    string     `json:"user_name"`
	PhoneNumber string     `json:"phone_number"`
	DateOfBirth *time.Time `json:"date_of_birth,omitempty"`
	Email       string     `json:"email"`
	Password    string     `json:"-"`
	RoleID      int64      `json:"role_id"`
	RoleName    string     `json:"role_name,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

// FullName returns the combined first and last name.
func (u *User) FullName() string {
	if u.FirstName == "" && u.LastName == "" {
		return u.UserName
	}
	return u.FirstName + " " + u.LastName
}

// IsAdmin returns true if the user role corresponds to an administrator.
func (u *User) IsAdmin() bool {
	return u.RoleName == "admin" || u.RoleID == 2
}
