package handler

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// UserHandler handles HTTP endpoints for administrative and self-service user management.
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler constructs a new UserHandler instance.
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// ListPaginated returns a paginated list of users.
func (h *UserHandler) ListPaginated(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "15"))

	result, err := h.userService.List(c.Context(), int32(page), int32(pageSize))
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve users")
	}

	return response.Success(c, fiber.StatusOK, result)
}

// ListAll returns all active users.
func (h *UserHandler) ListAll(c *fiber.Ctx) error {
	users, err := h.userService.ListAll(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve users")
	}

	return response.Success(c, fiber.StatusOK, users)
}

// GetUser retrieves a specific user by ID.
func (h *UserHandler) GetUser(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid user ID")
	}

	user, err := h.userService.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return response.NotFound(c, "user not found")
		}
		return response.InternalServerError(c, "failed to retrieve user")
	}

	return response.Success(c, fiber.StatusOK, user)
}

// CreateUser creates a new user through administrative actions.
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var input dto.CreateUserDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	user, err := h.userService.Create(c.Context(), input)
	if err != nil {
		return response.BadRequest(c, "CREATE_USER_FAILED", err.Error())
	}

	return response.Created(c, user)
}

// UpdateUser updates user details via administrative actions.
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid user ID")
	}

	var input dto.UpdateUserDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	user, err := h.userService.Update(c.Context(), id, input)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return response.NotFound(c, "user not found")
		}
		return response.BadRequest(c, "UPDATE_USER_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, user)
}

// UpdateProfile updates the profile of the authenticated caller.
func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := extractUserID(c)
	if !ok {
		return response.Unauthorized(c, "unauthenticated")
	}

	var input dto.UpdateProfileDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	user, err := h.userService.UpdateProfile(c.Context(), userID, input)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return response.NotFound(c, "user not found")
		}
		return response.BadRequest(c, "UPDATE_PROFILE_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, user)
}

// DeleteUser removes a user record.
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid user ID")
	}

	if err := h.userService.Delete(c.Context(), id); err != nil {
		return response.InternalServerError(c, "failed to delete user")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "Delete user success",
	})
}
