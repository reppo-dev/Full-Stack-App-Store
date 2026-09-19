package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	domainRepo "github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type TicketRepositorySQLC struct {
	queries *sqlc.Queries
}

func NewTicketRepositorySQLC(queries *sqlc.Queries) domainRepo.TicketRepository {
	return &TicketRepositorySQLC{queries: queries}
}

func (r *TicketRepositorySQLC) Create(ctx context.Context, t *entity.Ticket) (*entity.Ticket, error) {
	var assigned pgtype.Int8
	if t.AssignedTo != nil {
		assigned = pgtype.Int8{Int64: *t.AssignedTo, Valid: true}
	}

	created, err := r.queries.CreateTicket(ctx, sqlc.CreateTicketParams{
		UserID:     t.UserID,
		Subject:    t.Subject,
		Status:     string(t.Status),
		Priority:   string(t.Priority),
		Category:   t.Category,
		AssignedTo: assigned,
	})
	if err != nil {
		return nil, err
	}

	var assignedVal *int64
	if created.AssignedTo.Valid {
		v := created.AssignedTo.Int64
		assignedVal = &v
	}

	return &entity.Ticket{
		ID:         created.ID,
		CreatedAt:  created.CreatedAt.Time,
		UpdatedAt:  created.UpdatedAt.Time,
		UserID:     created.UserID,
		Subject:    created.Subject,
		Status:     entity.TicketStatus(created.Status),
		Priority:   entity.TicketPriority(created.Priority),
		Category:   created.Category,
		AssignedTo: assignedVal,
	}, nil
}

func (r *TicketRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Ticket, error) {
	row, err := r.queries.GetTicketByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTicketNotFound
		}
		return nil, err
	}

	var assignedVal *int64
	if row.AssignedTo.Valid {
		v := row.AssignedTo.Int64
		assignedVal = &v
	}

	return &entity.Ticket{
		ID:                row.ID,
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
		UserID:            row.UserID,
		Subject:           row.Subject,
		Status:            entity.TicketStatus(row.Status),
		Priority:          entity.TicketPriority(row.Priority),
		Category:          row.Category,
		AssignedTo:        assignedVal,
		UserFirstName:     row.UserFirstName.String,
		UserLastName:      row.UserLastName.String,
		UserEmail:         row.UserEmail,
		AssignedFirstName: row.AssignedFirstName.String,
		AssignedLastName:  row.AssignedLastName.String,
	}, nil
}

func (r *TicketRepositorySQLC) ListByUserID(ctx context.Context, userID int64, limit, offset int32) ([]*entity.Ticket, int64, error) {
	rows, err := r.queries.ListTicketsByUserID(ctx, sqlc.ListTicketsByUserIDParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.queries.CountTicketsByUserID(ctx, userID)
	if err != nil {
		return nil, 0, err
	}

	result := make([]*entity.Ticket, len(rows))
	for i, row := range rows {
		var assignedVal *int64
		if row.AssignedTo.Valid {
			v := row.AssignedTo.Int64
			assignedVal = &v
		}

		result[i] = &entity.Ticket{
			ID:           row.ID,
			CreatedAt:    row.CreatedAt.Time,
			UpdatedAt:    row.UpdatedAt.Time,
			UserID:       row.UserID,
			Subject:      row.Subject,
			Status:       entity.TicketStatus(row.Status),
			Priority:     entity.TicketPriority(row.Priority),
			Category:     row.Category,
			AssignedTo:   assignedVal,
			UserFirstName: row.UserFirstName.String,
			UserLastName:  row.UserLastName.String,
			UserEmail:     row.UserEmail,
			MessageCount:  row.MessageCount,
		}
	}

	return result, total, nil
}

func (r *TicketRepositorySQLC) ListAll(ctx context.Context, status, priority string, limit, offset int32) ([]*entity.Ticket, int64, error) {
	var statusParam pgtype.Text
	if status != "" {
		statusParam = pgtype.Text{String: status, Valid: true}
	}

	var priorityParam pgtype.Text
	if priority != "" {
		priorityParam = pgtype.Text{String: priority, Valid: true}
	}

	rows, err := r.queries.ListAllTickets(ctx, sqlc.ListAllTicketsParams{
		Limit:    limit,
		Offset:   offset,
		Status:   statusParam,
		Priority: priorityParam,
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.queries.CountAllTickets(ctx, sqlc.CountAllTicketsParams{
		Status:   statusParam,
		Priority: priorityParam,
	})
	if err != nil {
		return nil, 0, err
	}

	result := make([]*entity.Ticket, len(rows))
	for i, row := range rows {
		var assignedVal *int64
		if row.AssignedTo.Valid {
			v := row.AssignedTo.Int64
			assignedVal = &v
		}

		result[i] = &entity.Ticket{
			ID:                row.ID,
			CreatedAt:         row.CreatedAt.Time,
			UpdatedAt:         row.UpdatedAt.Time,
			UserID:            row.UserID,
			Subject:           row.Subject,
			Status:            entity.TicketStatus(row.Status),
			Priority:          entity.TicketPriority(row.Priority),
			Category:          row.Category,
			AssignedTo:        assignedVal,
			UserFirstName:     row.UserFirstName.String,
			UserLastName:      row.UserLastName.String,
			UserEmail:         row.UserEmail,
			AssignedFirstName: row.AssignedFirstName.String,
			AssignedLastName:  row.AssignedLastName.String,
			MessageCount:      row.MessageCount,
		}
	}

	return result, total, nil
}

func (r *TicketRepositorySQLC) UpdateStatus(ctx context.Context, id int64, status entity.TicketStatus) (*entity.Ticket, error) {
	updated, err := r.queries.UpdateTicketStatus(ctx, sqlc.UpdateTicketStatusParams{
		ID:     id,
		Status: string(status),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTicketNotFound
		}
		return nil, err
	}

	var assignedVal *int64
	if updated.AssignedTo.Valid {
		v := updated.AssignedTo.Int64
		assignedVal = &v
	}

	return &entity.Ticket{
		ID:         updated.ID,
		CreatedAt:  updated.CreatedAt.Time,
		UpdatedAt:  updated.UpdatedAt.Time,
		UserID:     updated.UserID,
		Subject:    updated.Subject,
		Status:     entity.TicketStatus(updated.Status),
		Priority:   entity.TicketPriority(updated.Priority),
		Category:   updated.Category,
		AssignedTo: assignedVal,
	}, nil
}

func (r *TicketRepositorySQLC) Assign(ctx context.Context, id int64, assignedTo int64) (*entity.Ticket, error) {
	var assigned pgtype.Int8
	if assignedTo > 0 {
		assigned = pgtype.Int8{Int64: assignedTo, Valid: true}
	}

	updated, err := r.queries.AssignTicket(ctx, sqlc.AssignTicketParams{
		ID:         id,
		AssignedTo: assigned,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTicketNotFound
		}
		return nil, err
	}

	var assignedVal *int64
	if updated.AssignedTo.Valid {
		v := updated.AssignedTo.Int64
		assignedVal = &v
	}

	return &entity.Ticket{
		ID:         updated.ID,
		CreatedAt:  updated.CreatedAt.Time,
		UpdatedAt:  updated.UpdatedAt.Time,
		UserID:     updated.UserID,
		Subject:    updated.Subject,
		Status:     entity.TicketStatus(updated.Status),
		Priority:   entity.TicketPriority(updated.Priority),
		Category:   updated.Category,
		AssignedTo: assignedVal,
	}, nil
}

func (r *TicketRepositorySQLC) CreateMessage(ctx context.Context, msg *entity.TicketMessage) (*entity.TicketMessage, error) {
	created, err := r.queries.CreateTicketMessage(ctx, sqlc.CreateTicketMessageParams{
		TicketID:   msg.TicketID,
		SenderID:   msg.SenderID,
		Message:    msg.Message,
		IsInternal: msg.IsInternal,
	})
	if err != nil {
		return nil, err
	}

	return &entity.TicketMessage{
		ID:         created.ID,
		CreatedAt:  created.CreatedAt.Time,
		TicketID:   created.TicketID,
		SenderID:   created.SenderID,
		Message:    created.Message,
		IsInternal: created.IsInternal,
	}, nil
}

func (r *TicketRepositorySQLC) ListMessagesByTicketID(ctx context.Context, ticketID int64) ([]*entity.TicketMessage, error) {
	rows, err := r.queries.ListTicketMessagesByTicketID(ctx, ticketID)
	if err != nil {
		return nil, err
	}

	result := make([]*entity.TicketMessage, len(rows))
	for i, row := range rows {
		result[i] = &entity.TicketMessage{
			ID:              row.ID,
			CreatedAt:       row.CreatedAt.Time,
			TicketID:        row.TicketID,
			SenderID:        row.SenderID,
			Message:         row.Message,
			IsInternal:      row.IsInternal,
			SenderFirstName: row.SenderFirstName.String,
			SenderLastName:  row.SenderLastName.String,
			SenderEmail:     row.SenderEmail,
			SenderImage:     row.SenderImage.String,
			SenderRole:      row.SenderRole.String,
		}
	}

	return result, nil
}

func (r *TicketRepositorySQLC) CountUnresolved(ctx context.Context) (int64, error) {
	return r.queries.CountUnresolvedTickets(ctx)
}
