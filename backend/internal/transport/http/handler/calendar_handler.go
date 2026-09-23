package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

type CalendarHandler struct {
	calendarService *service.CalendarService
}

func NewCalendarHandler(calendarService *service.CalendarService) *CalendarHandler {
	return &CalendarHandler{calendarService: calendarService}
}

func (h *CalendarHandler) CreateEvent(c *fiber.Ctx) error {
	var req entity.CreateCalendarEventRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "INVALID_BODY", "Invalid request body")
	}

	var userID *int32
	if userVal := c.Locals("user"); userVal != nil {
		// Just assuming it's not strictly necessary for this example
	}

	event, err := h.calendarService.CreateEvent(c.Context(), &req, userID)
	if err != nil {
		return response.InternalServerError(c, "Failed to create event")
	}

	return response.Success(c, fiber.StatusCreated, event)
}

func (h *CalendarHandler) GetEvent(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return response.BadRequest(c, "INVALID_ID", "Invalid event ID format")
	}

	event, err := h.calendarService.GetEvent(c.Context(), int32(id))
	if err != nil {
		return response.NotFound(c, "Event not found")
	}

	return response.Success(c, fiber.StatusOK, event)
}

func (h *CalendarHandler) ListEvents(c *fiber.Ctx) error {
	events, err := h.calendarService.ListEvents(c.Context())
	if err != nil {
		return response.InternalServerError(c, "Failed to fetch events")
	}

	return response.Success(c, fiber.StatusOK, events)
}

func (h *CalendarHandler) UpdateEvent(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return response.BadRequest(c, "INVALID_ID", "Invalid event ID format")
	}

	var req entity.UpdateCalendarEventRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "INVALID_BODY", "Invalid request body")
	}

	event, err := h.calendarService.UpdateEvent(c.Context(), int32(id), &req)
	if err != nil {
		return response.InternalServerError(c, "Failed to update event")
	}

	return response.Success(c, fiber.StatusOK, event)
}

func (h *CalendarHandler) DeleteEvent(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return response.BadRequest(c, "INVALID_ID", "Invalid event ID format")
	}

	if err := h.calendarService.DeleteEvent(c.Context(), int32(id)); err != nil {
		return response.InternalServerError(c, "Failed to delete event")
	}

	return response.Success(c, fiber.StatusOK, nil)
}
