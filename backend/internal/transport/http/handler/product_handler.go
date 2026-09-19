package handler

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// ProductHandler handles HTTP endpoints for product catalog operations.
type ProductHandler struct {
	productService *service.ProductService
}

// NewProductHandler constructs a new ProductHandler instance.
func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

// ListProducts returns a paginated list of catalog products.
// Supports query params: page, limit, category_id, is_active, all.
func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
	if c.Query("all") == "true" {
		products, err := h.productService.ListAll(c.Context())
		if err != nil {
			return response.InternalServerError(c, "failed to retrieve products")
		}
		return response.Success(c, fiber.StatusOK, products)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "15"))

	var categoryID *int64
	catQuery := c.Query("category_id")
	if catQuery == "" {
		catQuery = c.Query("categoryId")
	}
	if catQuery != "" {
		if parsed, err := strconv.ParseInt(catQuery, 10, 64); err == nil && parsed > 0 {
			categoryID = &parsed
		}
	}

	var isActive *bool
	if activeStr := c.Query("is_active"); activeStr != "" {
		val := activeStr == "true" || activeStr == "1"
		isActive = &val
	}

	res, err := h.productService.List(c.Context(), int32(page), int32(limit), categoryID, isActive)
	if err != nil {
		return response.InternalServerError(c, "failed to list products")
	}

	return response.SuccessWithMeta(c, fiber.StatusOK, res.Data, fiber.Map{
		"total":     res.Total,
		"page":      res.Page,
		"last_page": res.LastPage,
	})
}

// GetProduct retrieves a single product by numeric identifier or unique URL slug.
func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	param := strings.TrimSpace(c.Params("id"))
	if param == "" {
		return response.BadRequest(c, "INVALID_PARAM", "missing product identifier")
	}

	id, err := strconv.ParseInt(param, 10, 64)
	if err == nil && id > 0 {
		prod, err := h.productService.GetByID(c.Context(), id)
		if err == nil {
			return response.Success(c, fiber.StatusOK, prod)
		}
		if !errors.Is(err, domain.ErrProductNotFound) {
			return response.InternalServerError(c, "failed to retrieve product")
		}
	}

	// Fallback to lookup by slug
	prod, err := h.productService.GetBySlug(c.Context(), param)
	if err != nil {
		if errors.Is(err, domain.ErrProductNotFound) {
			return response.NotFound(c, "product not found")
		}
		return response.InternalServerError(c, "failed to retrieve product")
	}

	return response.Success(c, fiber.StatusOK, prod)
}

// GetProductBySlug retrieves a single product by unique URL slug.
func (h *ProductHandler) GetProductBySlug(c *fiber.Ctx) error {
	slug := strings.TrimSpace(c.Params("slug"))
	if slug == "" {
		return response.BadRequest(c, "INVALID_SLUG", "invalid product slug")
	}

	prod, err := h.productService.GetBySlug(c.Context(), slug)
	if err != nil {
		if errors.Is(err, domain.ErrProductNotFound) {
			return response.NotFound(c, "product not found")
		}
		return response.InternalServerError(c, "failed to retrieve product")
	}

	return response.Success(c, fiber.StatusOK, prod)
}

// CreateProduct creates a new product in the catalog (admin only).
func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var input dto.CreateProductDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	created, err := h.productService.Create(c.Context(), input)
	if err != nil {
		return response.BadRequest(c, "CREATE_PRODUCT_FAILED", err.Error())
	}

	return response.Created(c, created)
}

// UpdateProduct updates an existing product (admin only).
func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid product ID")
	}

	var input dto.UpdateProductDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	updated, err := h.productService.Update(c.Context(), id, input)
	if err != nil {
		if errors.Is(err, domain.ErrProductNotFound) {
			return response.NotFound(c, "product not found")
		}
		return response.BadRequest(c, "UPDATE_PRODUCT_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, updated)
}

// DeleteProduct deletes a product from the catalog (admin only).
func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid product ID")
	}

	if err := h.productService.Delete(c.Context(), id); err != nil {
		return response.InternalServerError(c, "failed to delete product")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "success delete product",
	})
}
