package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

type DashboardHandler struct {
	dashboardService *service.DashboardService
}

func NewDashboardHandler(dashboardService *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetMetrics(c *fiber.Ctx) error {
	metrics, err := h.dashboardService.GetMetrics(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to compute dashboard metrics")
	}

	return response.Success(c, fiber.StatusOK, metrics)
}
