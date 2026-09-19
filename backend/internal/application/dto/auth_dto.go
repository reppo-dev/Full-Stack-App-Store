package dto

import "time"

// RegisterRequestDTO holds input data for user registration.
type RegisterRequestDTO struct {
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	Image           string     `json:"image"`
	UserName        string     `json:"user_name"`
	PhoneNumber     string     `json:"phone_number"`
	DateOfBirth     *time.Time `json:"date_of_birth,omitempty"`
	Email           string     `json:"email"`
	Password        string     `json:"password"`
	PasswordConfirm string     `json:"password_confirm"`
}

// LoginRequestDTO holds credentials for user authentication.
type LoginRequestDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponseDTO represents the successful authentication output payload.
type AuthResponseDTO struct {
	Token string      `json:"token"`
	User  UserViewDTO `json:"user"`
}

// UpdatePasswordDTO represents the payload for changing a password.
type UpdatePasswordDTO struct {
	Password        string `json:"password"`
	PasswordConfirm string `json:"password_confirm"`
}
