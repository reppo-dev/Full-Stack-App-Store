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

// RoleHandler handles HTTP endpoints for role and permission administration.
type RoleHandler struct {
	roleService *service.RoleService
}

// NewRoleHandler constructs a new RoleHandler instance.
func NewRoleHandler(roleService *service.RoleService) *RoleHandler {
	return &RoleHandler{roleService: roleService}
}

// ListRoles returns all active roles and their permissions.
func (h *RoleHandler) ListRoles(c *fiber.Ctx) error {
	roles, err := h.roleService.List(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve roles")
	}

	return response.Success(c, fiber.StatusOK, roles)
}

// GetRole retrieves a specific role with its assigned permissions.
func (h *RoleHandler) GetRole(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid role ID")
	}

	role, err := h.roleService.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrRoleNotFound) {
			return response.NotFound(c, "role not found")
		}
		return response.InternalServerError(c, "failed to retrieve role")
	}

	return response.Success(c, fiber.StatusOK, role)
}

// CreateRole creates a new role with assigned permissions.
func (h *RoleHandler) CreateRole(c *fiber.Ctx) error {
	var input dto.CreateRoleDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	role, err := h.roleService.Create(c.Context(), input)
	if err != nil {
		return response.BadRequest(c, "CREATE_ROLE_FAILED", err.Error())
	}

	return response.Created(c, role)
}

// UpdateRole modifies a role and its assigned permissions.
func (h *RoleHandler) UpdateRole(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid role ID")
	}

	var input dto.UpdateRoleDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	role, err := h.roleService.Update(c.Context(), id, input)
	if err != nil {
		if errors.Is(err, domain.ErrRoleNotFound) {
			return response.NotFound(c, "role not found")
		}
		return response.BadRequest(c, "UPDATE_ROLE_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, role)
}

// DeleteRole removes a role.
func (h *RoleHandler) DeleteRole(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid role ID")
	}

	if err := h.roleService.Delete(c.Context(), id); err != nil {
		return response.InternalServerError(c, "failed to delete role")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "Delete role success",
	})
}

// ListPermissions returns all available system permissions.
func (h *RoleHandler) ListPermissions(c *fiber.Ctx) error {
	perms, err := h.roleService.ListPermissions(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve permissions")
	}

	return response.Success(c, fiber.StatusOK, perms)
}
