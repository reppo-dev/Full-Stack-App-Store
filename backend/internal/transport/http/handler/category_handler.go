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

// CategoryHandler handles HTTP endpoints for product catalog category taxonomy.
type CategoryHandler struct {
	categoryService *service.CategoryService
}

// NewCategoryHandler constructs a new CategoryHandler instance.
func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// ListCategories returns a flat list of all active categories.
func (h *CategoryHandler) ListCategories(c *fiber.Ctx) error {
	cats, err := h.categoryService.List(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve categories")
	}

	return response.Success(c, fiber.StatusOK, cats)
}

// GetTree returns a nested hierarchical taxonomy tree of categories.
func (h *CategoryHandler) GetTree(c *fiber.Ctx) error {
	tree, err := h.categoryService.GetTree(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve category tree")
	}

	return response.Success(c, fiber.StatusOK, tree)
}

// GetCategory retrieves a category by numeric ID.
func (h *CategoryHandler) GetCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid category ID")
	}

	cat, err := h.categoryService.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			return response.NotFound(c, "category not found")
		}
		return response.InternalServerError(c, "failed to retrieve category")
	}

	return response.Success(c, fiber.StatusOK, cat)
}

// GetCategoryBySlug retrieves a category by unique SEO slug.
func (h *CategoryHandler) GetCategoryBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return response.BadRequest(c, "INVALID_SLUG", "invalid category slug")
	}

	cat, err := h.categoryService.GetBySlug(c.Context(), slug)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			return response.NotFound(c, "category not found")
		}
		return response.InternalServerError(c, "failed to retrieve category")
	}

	return response.Success(c, fiber.StatusOK, cat)
}

// CreateCategory creates a new product category (admin only).
func (h *CategoryHandler) CreateCategory(c *fiber.Ctx) error {
	var input dto.CreateCategoryDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	cat, err := h.categoryService.Create(c.Context(), input)
	if err != nil {
		return response.BadRequest(c, "CREATE_CATEGORY_FAILED", err.Error())
	}

	return response.Created(c, cat)
}

// UpdateCategory modifies an existing category (admin only).
func (h *CategoryHandler) UpdateCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid category ID")
	}

	var input dto.UpdateCategoryDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	cat, err := h.categoryService.Update(c.Context(), id, input)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			return response.NotFound(c, "category not found")
		}
		return response.BadRequest(c, "UPDATE_CATEGORY_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, cat)
}

// DeleteCategory removes a category (admin only).
func (h *CategoryHandler) DeleteCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid category ID")
	}

	if err := h.categoryService.Delete(c.Context(), id); err != nil {
		return response.InternalServerError(c, "failed to delete category")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "success delete",
	})
}
