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

type TicketHandler struct {
	ticketService *service.TicketService
}

func NewTicketHandler(ticketService *service.TicketService) *TicketHandler {
	return &TicketHandler{ticketService: ticketService}
}

func (h *TicketHandler) CreateTicket(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(int64)
	if !ok || userID <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	var input dto.CreateTicketDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	ticket, err := h.ticketService.CreateTicket(c.Context(), userID, input)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidTicketPriority) {
			return response.BadRequest(c, "INVALID_PRIORITY", err.Error())
		}
		return response.BadRequest(c, "CREATE_FAILED", err.Error())
	}

	return response.Created(c, ticket)
}

func (h *TicketHandler) GetTickets(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(int64)
	if !ok || userID <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	role, _ := c.Locals("role").(string)
	isAdmin := role == "admin"

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	status := c.Query("status", "")
	priority := c.Query("priority", "")

	var result *dto.TicketPaginationDTO
	var err error

	if isAdmin {
		result, err = h.ticketService.ListAllTickets(c.Context(), status, priority, int32(page), int32(limit))
	} else {
		result, err = h.ticketService.ListUserTickets(c.Context(), userID, int32(page), int32(limit))
	}

	if err != nil {
		return response.InternalServerError(c, "failed to list tickets")
	}

	return response.SuccessWithMeta(c, fiber.StatusOK, result.Data, fiber.Map{
		"total":     result.Total,
		"page":      result.Page,
		"last_page": result.LastPage,
	})
}

func (h *TicketHandler) GetTicketByID(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid ticket id")
	}

	userID, ok := c.Locals("user_id").(int64)
	if !ok || userID <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	role, _ := c.Locals("role").(string)
	isAdmin := role == "admin"

	ticket, err := h.ticketService.GetTicket(c.Context(), id, userID, isAdmin)
	if err != nil {
		if errors.Is(err, domain.ErrTicketNotFound) {
			return response.NotFound(c, "ticket not found")
		}
		if errors.Is(err, domain.ErrUnauthorizedTicketAccess) {
			return response.Forbidden(c, "access denied to this ticket")
		}
		return response.InternalServerError(c, "failed to fetch ticket")
	}

	return response.Success(c, fiber.StatusOK, ticket)
}

func (h *TicketHandler) AddMessage(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid ticket id")
	}

	userID, ok := c.Locals("user_id").(int64)
	if !ok || userID <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	role, _ := c.Locals("role").(string)
	isAdmin := role == "admin"

	var input dto.CreateTicketMessageDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	msg, err := h.ticketService.AddMessage(c.Context(), id, userID, isAdmin, input)
	if err != nil {
		if errors.Is(err, domain.ErrTicketNotFound) {
			return response.NotFound(c, "ticket not found")
		}
		if errors.Is(err, domain.ErrUnauthorizedTicketAccess) {
			return response.Forbidden(c, "access denied to this ticket")
		}
		return response.BadRequest(c, "MESSAGE_FAILED", err.Error())
	}

	return response.Created(c, msg)
}

func (h *TicketHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid ticket id")
	}

	userID, ok := c.Locals("user_id").(int64)
	if !ok || userID <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	role, _ := c.Locals("role").(string)
	isAdmin := role == "admin"

	var input dto.UpdateTicketStatusDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	ticket, err := h.ticketService.UpdateStatus(c.Context(), id, userID, isAdmin, input.Status)
	if err != nil {
		if errors.Is(err, domain.ErrTicketNotFound) {
			return response.NotFound(c, "ticket not found")
		}
		if errors.Is(err, domain.ErrInvalidTicketStatus) {
			return response.BadRequest(c, "INVALID_STATUS", err.Error())
		}
		if errors.Is(err, domain.ErrForbidden) {
			return response.Forbidden(c, "cannot perform this status change")
		}
		if errors.Is(err, domain.ErrUnauthorizedTicketAccess) {
			return response.Forbidden(c, "access denied to this ticket")
		}
		return response.BadRequest(c, "UPDATE_FAILED", err.Error())
	}

	return response.Success(c, fiber.StatusOK, ticket)
}

func (h *TicketHandler) AssignTicket(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil || id <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid ticket id")
	}

	var input dto.AssignTicketDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request body")
	}

	ticket, err := h.ticketService.AssignTicket(c.Context(), id, input.AssignedTo)
	if err != nil {
		if errors.Is(err, domain.ErrTicketNotFound) {
			return response.NotFound(c, "ticket not found")
		}
		return response.InternalServerError(c, "failed to assign ticket")
	}

	return response.Success(c, fiber.StatusOK, ticket)
}
