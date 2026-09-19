package handler

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// OrderHandler handles HTTP endpoints for commerce checkout, customer orders, and admin fulfillment.
type OrderHandler struct {
	orderService *service.OrderService
}

// NewOrderHandler constructs a new OrderHandler instance.
func NewOrderHandler(orderService *service.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

// CreateOrder processes customer checkout.
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var input dto.CreateOrderDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	var userIDPtr *int64
	if uid, ok := c.Locals("user_id").(int64); ok && uid > 0 {
		userIDPtr = &uid
	}

	order, err := h.orderService.CreateOrder(c.Context(), userIDPtr, input)
	if err != nil {
		if errors.Is(err, domain.ErrEmptyOrderItems) {
			return response.BadRequest(c, "EMPTY_ITEMS", err.Error())
		}
		if errors.Is(err, domain.ErrInsufficientStock) {
			return response.BadRequest(c, "INSUFFICIENT_STOCK", err.Error())
		}
		if errors.Is(err, domain.ErrProductNotFound) {
			return response.NotFound(c, "one or more products not found")
		}
		return response.BadRequest(c, "CHECKOUT_FAILED", err.Error())
	}

	return response.Created(c, order)
}

// GetMyOrders returns the purchase history of the authenticated caller.
func (h *OrderHandler) GetMyOrders(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(int64)
	if !ok || uid <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	orders, err := h.orderService.ListUserOrders(c.Context(), uid)
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve order history")
	}

	return response.Success(c, fiber.StatusOK, orders)
}

// GetOrder returns a single order by ID with ownership verification.
func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid order ID")
	}

	var uidPtr *int64
	if uid, ok := c.Locals("user_id").(int64); ok && uid > 0 {
		uidPtr = &uid
	}

	role, _ := c.Locals("role").(string)
	isAdmin := role == "admin"

	order, err := h.orderService.GetOrderByID(c.Context(), id, uidPtr, isAdmin)
	if err != nil {
		if errors.Is(err, domain.ErrOrderNotFound) {
			return response.NotFound(c, "order not found")
		}
		if errors.Is(err, domain.ErrForbidden) {
			return response.Forbidden(c, "forbidden: cannot view other users' orders")
		}
		return response.InternalServerError(c, "failed to retrieve order")
	}

	return response.Success(c, fiber.StatusOK, order)
}

// ListAllOrders lists all system orders (admin only).
func (h *OrderHandler) ListAllOrders(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "15"))

	res, err := h.orderService.ListAllOrders(c.Context(), int32(page), int32(limit))
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve orders")
	}

	return response.SuccessWithMeta(c, fiber.StatusOK, res.Data, fiber.Map{
		"total":     res.Total,
		"page":      res.Page,
		"last_page": res.LastPage,
	})
}

// UpdateStatus updates the fulfillment status of an order (admin only).
func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid order ID")
	}

	var input dto.UpdateOrderStatusDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	updated, err := h.orderService.UpdateStatus(c.Context(), id, entity.OrderStatus(input.Status))
	if err != nil {
		if errors.Is(err, domain.ErrOrderNotFound) {
			return response.NotFound(c, "order not found")
		}
		if errors.Is(err, domain.ErrInvalidOrderStatus) {
			return response.BadRequest(c, "INVALID_STATUS", err.Error())
		}
		return response.InternalServerError(c, "failed to update order status")
	}

	return response.Success(c, fiber.StatusOK, updated)
}

// ExportCSV streams an in-memory CSV export directly to the client response.
func (h *OrderHandler) ExportCSV(c *fiber.Ctx) error {
	data, err := h.orderService.ExportOrdersCSV(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to generate CSV export")
	}

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment; filename=orders.csv")
	return c.Send(data)
}

// GetChart returns daily sales trends for admin reporting.
func (h *OrderHandler) GetChart(c *fiber.Ctx) error {
	chart, err := h.orderService.GetSalesChart(c.Context())
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve sales chart")
	}

	return response.Success(c, fiber.StatusOK, chart)
}
