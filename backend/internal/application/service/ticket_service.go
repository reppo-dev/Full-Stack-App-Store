package service

import (
	"context"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type TicketService struct {
	ticketRepo repository.TicketRepository
}

func NewTicketService(ticketRepo repository.TicketRepository) *TicketService {
	return &TicketService{ticketRepo: ticketRepo}
}

func (s *TicketService) CreateTicket(ctx context.Context, userID int64, input dto.CreateTicketDTO) (*dto.TicketViewDTO, error) {
	subject := strings.TrimSpace(input.Subject)
	if subject == "" {
		return nil, domain.ErrInvalidCredentials // Reusing validation error or generic
	}

	priority := input.Priority
	if priority == "" {
		priority = entity.TicketPriorityMedium
	}
	if !priority.IsValid() {
		return nil, domain.ErrInvalidTicketPriority
	}

	category := strings.TrimSpace(input.Category)
	if category == "" {
		category = "general"
	}

	ticket := &entity.Ticket{
		UserID:   userID,
		Subject:  subject,
		Status:   entity.TicketStatusOpen,
		Priority: priority,
		Category: category,
	}

	created, err := s.ticketRepo.Create(ctx, ticket)
	if err != nil {
		return nil, err
	}

	initMsg := strings.TrimSpace(input.InitialMessage)
	if initMsg != "" {
		_, _ = s.ticketRepo.CreateMessage(ctx, &entity.TicketMessage{
			TicketID:   created.ID,
			SenderID:   userID,
			Message:    initMsg,
			IsInternal: false,
		})
	}

	return s.toTicketViewDTO(created, nil), nil
}

func (s *TicketService) GetTicket(ctx context.Context, ticketID int64, userID int64, isAdmin bool) (*dto.TicketViewDTO, error) {
	ticket, err := s.ticketRepo.GetByID(ctx, ticketID)
	if err != nil {
		return nil, err
	}

	if !isAdmin && ticket.UserID != userID {
		return nil, domain.ErrUnauthorizedTicketAccess
	}

	messages, err := s.ticketRepo.ListMessagesByTicketID(ctx, ticketID)
	if err != nil {
		return nil, err
	}

	filteredMessages := make([]dto.TicketMessageViewDTO, 0, len(messages))
	for _, m := range messages {
		if !isAdmin && m.IsInternal {
			continue
		}
		filteredMessages = append(filteredMessages, dto.TicketMessageViewDTO{
			ID:              m.ID,
			CreatedAt:       m.CreatedAt,
			TicketID:        m.TicketID,
			SenderID:        m.SenderID,
			Message:         m.Message,
			IsInternal:      m.IsInternal,
			SenderFirstName: m.SenderFirstName,
			SenderLastName:  m.SenderLastName,
			SenderEmail:     m.SenderEmail,
			SenderImage:     m.SenderImage,
			SenderRole:      m.SenderRole,
		})
	}

	view := s.toTicketViewDTO(ticket, filteredMessages)
	return view, nil
}

func (s *TicketService) ListUserTickets(ctx context.Context, userID int64, page, limit int32) (*dto.TicketPaginationDTO, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	tickets, total, err := s.ticketRepo.ListByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	views := make([]dto.TicketViewDTO, len(tickets))
	for i, t := range tickets {
		views[i] = *s.toTicketViewDTO(t, nil)
	}

	lastPage := int32((total + int64(limit) - 1) / int64(limit))
	if lastPage < 1 {
		lastPage = 1
	}

	return &dto.TicketPaginationDTO{
		Data:     views,
		Total:    total,
		Page:     page,
		LastPage: lastPage,
	}, nil
}

func (s *TicketService) ListAllTickets(ctx context.Context, status, priority string, page, limit int32) (*dto.TicketPaginationDTO, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	tickets, total, err := s.ticketRepo.ListAll(ctx, status, priority, limit, offset)
	if err != nil {
		return nil, err
	}

	views := make([]dto.TicketViewDTO, len(tickets))
	for i, t := range tickets {
		views[i] = *s.toTicketViewDTO(t, nil)
	}

	lastPage := int32((total + int64(limit) - 1) / int64(limit))
	if lastPage < 1 {
		lastPage = 1
	}

	return &dto.TicketPaginationDTO{
		Data:     views,
		Total:    total,
		Page:     page,
		LastPage: lastPage,
	}, nil
}

func (s *TicketService) AddMessage(ctx context.Context, ticketID int64, senderID int64, isAdmin bool, input dto.CreateTicketMessageDTO) (*dto.TicketMessageViewDTO, error) {
	msgContent := strings.TrimSpace(input.Message)
	if msgContent == "" {
		return nil, domain.ErrInvalidCredentials
	}

	ticket, err := s.ticketRepo.GetByID(ctx, ticketID)
	if err != nil {
		return nil, err
	}

	if !isAdmin && ticket.UserID != senderID {
		return nil, domain.ErrUnauthorizedTicketAccess
	}

	isInternal := input.IsInternal && isAdmin

	created, err := s.ticketRepo.CreateMessage(ctx, &entity.TicketMessage{
		TicketID:   ticketID,
		SenderID:   senderID,
		Message:    msgContent,
		IsInternal: isInternal,
	})
	if err != nil {
		return nil, err
	}

	// Reopen resolved or closed ticket if customer sends a new message
	if !isAdmin && (ticket.Status == entity.TicketStatusResolved || ticket.Status == entity.TicketStatusClosed) {
		_, _ = s.ticketRepo.UpdateStatus(ctx, ticketID, entity.TicketStatusInProgress)
	}

	return &dto.TicketMessageViewDTO{
		ID:         created.ID,
		CreatedAt:  created.CreatedAt,
		TicketID:   created.TicketID,
		SenderID:   created.SenderID,
		Message:    created.Message,
		IsInternal: created.IsInternal,
	}, nil
}

func (s *TicketService) UpdateStatus(ctx context.Context, ticketID int64, userID int64, isAdmin bool, status entity.TicketStatus) (*dto.TicketViewDTO, error) {
	if !status.IsValid() {
		return nil, domain.ErrInvalidTicketStatus
	}

	ticket, err := s.ticketRepo.GetByID(ctx, ticketID)
	if err != nil {
		return nil, err
	}

	if !isAdmin {
		if ticket.UserID != userID {
			return nil, domain.ErrUnauthorizedTicketAccess
		}
		// Customers can only close/resolve their own ticket
		if status != entity.TicketStatusClosed && status != entity.TicketStatusResolved {
			return nil, domain.ErrForbidden
		}
	}

	updated, err := s.ticketRepo.UpdateStatus(ctx, ticketID, status)
	if err != nil {
		return nil, err
	}

	return s.toTicketViewDTO(updated, nil), nil
}

func (s *TicketService) AssignTicket(ctx context.Context, ticketID int64, assignedTo int64) (*dto.TicketViewDTO, error) {
	updated, err := s.ticketRepo.Assign(ctx, ticketID, assignedTo)
	if err != nil {
		return nil, err
	}
	return s.toTicketViewDTO(updated, nil), nil
}

func (s *TicketService) toTicketViewDTO(t *entity.Ticket, messages []dto.TicketMessageViewDTO) *dto.TicketViewDTO {
	return &dto.TicketViewDTO{
		ID:                t.ID,
		CreatedAt:         t.CreatedAt,
		UpdatedAt:         t.UpdatedAt,
		UserID:            t.UserID,
		Subject:           t.Subject,
		Status:            t.Status,
		Priority:          t.Priority,
		Category:          t.Category,
		AssignedTo:        t.AssignedTo,
		UserFirstName:     t.UserFirstName,
		UserLastName:      t.UserLastName,
		UserEmail:         t.UserEmail,
		AssignedFirstName: t.AssignedFirstName,
		AssignedLastName:  t.AssignedLastName,
		MessageCount:      t.MessageCount,
		Messages:          messages,
	}
}
