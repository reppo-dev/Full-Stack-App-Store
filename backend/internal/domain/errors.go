package domain

import "errors"

// Sentinel Domain Errors
var (
	ErrUserNotFound          = errors.New("user not found")
	ErrEmailAlreadyExists    = errors.New("email is already registered")
	ErrUsernameAlreadyExists = errors.New("username is already taken")
	ErrInvalidCredentials    = errors.New("invalid email or password")
	ErrPasswordMismatch      = errors.New("password confirmation does not match")
	ErrInvalidToken          = errors.New("invalid or expired token")
	ErrRoleNotFound          = errors.New("role not found")
	ErrRoleAlreadyExists     = errors.New("role name already exists")
	ErrUnauthorized          = errors.New("unauthorized access")
	ErrForbidden             = errors.New("forbidden: insufficient permissions")

	// Catalog domain errors
	ErrProductNotFound       = errors.New("product not found")
	ErrCategoryNotFound      = errors.New("category not found")
	ErrInsufficientStock     = errors.New("insufficient product stock")
	ErrDuplicateProductSlug  = errors.New("product slug already exists")
	ErrDuplicateCategorySlug = errors.New("category slug already exists")

	// Commerce & Transaction domain errors
	ErrOrderNotFound           = errors.New("order not found")
	ErrFavoriteNotFound        = errors.New("favorite not found")
	ErrFavoriteAlreadyExists   = errors.New("product is already in favorites")
	ErrEmptyOrderItems         = errors.New("order must contain at least one item")
	ErrInvalidOrderStatus       = errors.New("invalid order status")
	ErrDuplicateIdempotencyKey = errors.New("duplicate transaction idempotency key")

	// Support & Ticketing domain errors
	ErrTicketNotFound           = errors.New("ticket not found")
	ErrInvalidTicketStatus      = errors.New("invalid ticket status")
	ErrInvalidTicketPriority    = errors.New("invalid ticket priority")
	ErrUnauthorizedTicketAccess = errors.New("unauthorized ticket access")
)
