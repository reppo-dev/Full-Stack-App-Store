package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type sqlcCalendarRepository struct {
	q *sqlc.Queries
}

func NewCalendarRepository(q *sqlc.Queries) repository.CalendarRepository {
	return &sqlcCalendarRepository{q: q}
}

func (r *sqlcCalendarRepository) CreateCalendarEvent(ctx context.Context, req *entity.CreateCalendarEventRequest, userID *int32) (*entity.CalendarEvent, error) {
	params := sqlc.CreateCalendarEventParams{
		Title:       req.Title,
		Description: pgtype.Text{String: *req.Description, Valid: req.Description != nil},
		StartDate:   pgtype.Timestamp{Time: req.StartDate, Valid: !req.StartDate.IsZero()},
		EndDate:     func() pgtype.Timestamp { if req.EndDate != nil { return pgtype.Timestamp{Time: *req.EndDate, Valid: true} } else { return pgtype.Timestamp{} } }(),
		Type:        req.Type,
		Color:       req.Color,
		Address:     pgtype.Text{String: *req.Address, Valid: req.Address != nil},
		CreatedBy:   func() pgtype.Int4 { if userID != nil { return pgtype.Int4{Int32: *userID, Valid: true} } else { return pgtype.Int4{} } }(),
	}
	row, err := r.q.CreateCalendarEvent(ctx, params)
	if err != nil {
		return nil, err
	}
	return r.toEntity(&row), nil
}

func (r *sqlcCalendarRepository) GetCalendarEvent(ctx context.Context, id int32) (*entity.CalendarEvent, error) {
	row, err := r.q.GetCalendarEvent(ctx, id)
	if err != nil {
		return nil, err
	}
	return r.toEntity(&row), nil
}

func (r *sqlcCalendarRepository) ListCalendarEvents(ctx context.Context) ([]*entity.CalendarEvent, error) {
	rows, err := r.q.ListCalendarEvents(ctx)
	if err != nil {
		return nil, err
	}
	var events []*entity.CalendarEvent
	for _, row := range rows {
		events = append(events, r.toEntity(&row))
	}
	return events, nil
}

func (r *sqlcCalendarRepository) UpdateCalendarEvent(ctx context.Context, id int32, req *entity.UpdateCalendarEventRequest) (*entity.CalendarEvent, error) {
	params := sqlc.UpdateCalendarEventParams{
		ID:          id,
		Title:       func() string { if req.Title != nil { return *req.Title } else { return "" } }(),
		Description: func() pgtype.Text { if req.Description != nil { return pgtype.Text{String: *req.Description, Valid: true} } else { return pgtype.Text{} } }(),
		StartDate:   func() pgtype.Timestamp { if req.StartDate != nil { return pgtype.Timestamp{Time: *req.StartDate, Valid: true} } else { return pgtype.Timestamp{} } }(),
		EndDate:     func() pgtype.Timestamp { if req.EndDate != nil { return pgtype.Timestamp{Time: *req.EndDate, Valid: true} } else { return pgtype.Timestamp{} } }(),
		Type:        func() string { if req.Type != nil { return *req.Type } else { return "" } }(),
		Color:       func() string { if req.Color != nil { return *req.Color } else { return "" } }(),
		Address:     func() pgtype.Text { if req.Address != nil { return pgtype.Text{String: *req.Address, Valid: true} } else { return pgtype.Text{} } }(),
	}
	row, err := r.q.UpdateCalendarEvent(ctx, params)
	if err != nil {
		return nil, err
	}
	return r.toEntity(&row), nil
}

func (r *sqlcCalendarRepository) DeleteCalendarEvent(ctx context.Context, id int32) error {
	return r.q.DeleteCalendarEvent(ctx, id)
}

func (r *sqlcCalendarRepository) toEntity(row *sqlc.CalendarEvent) *entity.CalendarEvent {
	return &entity.CalendarEvent{
		ID:          row.ID,
		Title:       row.Title,
		Description: func() *string { if row.Description.Valid { s := row.Description.String; return &s }; return nil }(),
		StartDate:   row.StartDate.Time,
		EndDate:     func() *time.Time { if row.EndDate.Valid { return &row.EndDate.Time }; return nil }(),
		Type:        row.Type,
		Color:       row.Color,
		Address:     func() *string { if row.Address.Valid { s := row.Address.String; return &s }; return nil }(),
		CreatedBy:   func() *int32 { if row.CreatedBy.Valid { v := row.CreatedBy.Int32; return &v }; return nil }(),
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}
}
