package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/service"
)

type DynamicUIHandler struct {
	svc service.DynamicUIService
}

func NewDynamicUIHandler(svc service.DynamicUIService) *DynamicUIHandler {
	return &DynamicUIHandler{svc: svc}
}

func (h *DynamicUIHandler) GetBrands(c *fiber.Ctx) error {
	brands, err := h.svc.GetActiveBrands(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch brands",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    brands,
	})
}

func (h *DynamicUIHandler) GetStories(c *fiber.Ctx) error {
	stories, err := h.svc.GetActiveStories(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch stories",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    stories,
	})
}
