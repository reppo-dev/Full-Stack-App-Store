package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

type CalendarRepository interface {
	CreateCalendarEvent(ctx context.Context, req *entity.CreateCalendarEventRequest, userID *int32) (*entity.CalendarEvent, error)
	GetCalendarEvent(ctx context.Context, id int32) (*entity.CalendarEvent, error)
	ListCalendarEvents(ctx context.Context) ([]*entity.CalendarEvent, error)
	UpdateCalendarEvent(ctx context.Context, id int32, req *entity.UpdateCalendarEventRequest) (*entity.CalendarEvent, error)
	DeleteCalendarEvent(ctx context.Context, id int32) error
}
