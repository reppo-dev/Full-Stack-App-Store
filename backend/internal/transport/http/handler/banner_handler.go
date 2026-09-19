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

type BannerHandler struct {
	bannerService *service.BannerService
}

func NewBannerHandler(bannerService *service.BannerService) *BannerHandler {
	return &BannerHandler{bannerService: bannerService}
}

// ListActiveBanners: GET /api/v1/banners (Public)
func (h *BannerHandler) ListActiveBanners(c *fiber.Ctx) error {
	bannerType := c.Query("type", "")
	banners, err := h.bannerService.ListActiveBanners(c.Context(), bannerType)
	if err != nil {
		return response.InternalServerError(c, "failed to list banners")
	}
	return response.Success(c, fiber.StatusOK, banners)
}

// ListAllBanners: GET /api/v1/banners/admin (Admin Only)
func (h *BannerHandler) ListAllBanners(c *fiber.Ctx) error {
	banners, err := h.bannerService.ListAllBanners(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to list all banners")
	}
	return response.Success(c, fiber.StatusOK, banners)
}

// GetBannerByID: GET /api/v1/banners/:id (Public)
func (h *BannerHandler) GetBannerByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid banner id")
	}

	banner, err := h.bannerService.GetBannerByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrBannerNotFound) {
			return response.NotFound(c, "banner not found")
		}
		return response.InternalServerError(c, "failed to fetch banner")
	}
	return response.Success(c, fiber.StatusOK, banner)
}

// CreateBanner: POST /api/v1/banners (Admin Only)
func (h *BannerHandler) CreateBanner(c *fiber.Ctx) error {
	var input dto.CreateBannerDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	if input.Title == "" || input.ImageURL == "" {
		return response.BadRequest(c, "REQUIRED_FIELDS", "title and image_url are required")
	}

	created, err := h.bannerService.CreateBanner(c.Context(), input)
	if err != nil {
		return response.InternalServerError(c, "failed to create banner")
	}
	return response.Created(c, created)
}

// UpdateBanner: PUT /api/v1/banners/:id (Admin Only)
func (h *BannerHandler) UpdateBanner(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid banner id")
	}

	var input dto.UpdateBannerDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	updated, err := h.bannerService.UpdateBanner(c.Context(), id, input)
	if err != nil {
		if errors.Is(err, domain.ErrBannerNotFound) {
			return response.NotFound(c, "banner not found")
		}
		return response.InternalServerError(c, "failed to update banner")
	}
	return response.Success(c, fiber.StatusOK, updated)
}

// DeleteBanner: DELETE /api/v1/banners/:id (Admin Only)
func (h *BannerHandler) DeleteBanner(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid banner id")
	}

	err = h.bannerService.DeleteBanner(c.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrBannerNotFound) {
			return response.NotFound(c, "banner not found")
		}
		return response.InternalServerError(c, "failed to delete banner")
	}
	return response.Success(c, fiber.StatusOK, fiber.Map{"deleted": true})
}
