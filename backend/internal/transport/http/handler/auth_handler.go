package handler

import (
	"errors"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// AuthHandler handles HTTP requests for user registration, authentication, and session management.
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler constructs a new AuthHandler instance.
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register creates a new user account.
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var input dto.RegisterRequestDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	result, err := h.authService.Register(c.Context(), input)
	if err != nil {
		if errors.Is(err, domain.ErrPasswordMismatch) {
			return response.BadRequest(c, "PASSWORD_MISMATCH", "password confirmation does not match")
		}
		if errors.Is(err, domain.ErrEmailAlreadyExists) {
			return response.Error(c, fiber.StatusConflict, "EMAIL_EXISTS", "email is already registered")
		}
		if errors.Is(err, domain.ErrUsernameAlreadyExists) {
			return response.Error(c, fiber.StatusConflict, "USERNAME_EXISTS", "username is already taken")
		}
		return response.BadRequest(c, "REGISTRATION_FAILED", err.Error())
	}

	// Set HTTP-only session cookie
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    result.Token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return response.Created(c, result)
}

// Login verifies credentials and establishes an authenticated session.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input dto.LoginRequestDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	result, err := h.authService.Login(c.Context(), input)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidCredentials) {
			return response.Error(c, fiber.StatusUnauthorized, "INVALID_CREDENTIALS", "invalid email or password")
		}
		return response.BadRequest(c, "LOGIN_FAILED", err.Error())
	}

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    result.Token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return response.Success(c, fiber.StatusOK, result)
}

// Logout terminates the authenticated session by expiring the cookie.
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "success log out",
	})
}

// Me retrieves the profile of the currently authenticated user.
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID, ok := extractUserID(c)
	if !ok {
		return response.Unauthorized(c, "unauthenticated")
	}

	user, err := h.authService.GetUserByID(c.Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return response.NotFound(c, "user not found")
		}
		return response.InternalServerError(c, "failed to retrieve user profile")
	}

	return response.Success(c, fiber.StatusOK, user)
}

// UpdatePassword modifies the password of the currently authenticated user.
func (h *AuthHandler) UpdatePassword(c *fiber.Ctx) error {
	userID, ok := extractUserID(c)
	if !ok {
		return response.Unauthorized(c, "unauthenticated")
	}

	var input dto.UpdatePasswordDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	if err := h.authService.UpdatePassword(c.Context(), userID, input); err != nil {
		if errors.Is(err, domain.ErrPasswordMismatch) {
			return response.BadRequest(c, "PASSWORD_MISMATCH", "password confirmation does not match")
		}
		return response.BadRequest(c, "UPDATE_PASSWORD_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "password updated successfully",
	})
}

func extractUserID(c *fiber.Ctx) (int64, bool) {
	if id, ok := c.Locals("user_id").(int64); ok && id > 0 {
		return id, true
	}
	if strID, ok := c.Locals("userId").(string); ok && strID != "" {
		if id, err := strconv.ParseInt(strID, 10, 64); err == nil && id > 0 {
			return id, true
		}
	}
	return 0, false
}
