package service

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type CalendarService struct {
	calendarRepo repository.CalendarRepository
}

func NewCalendarService(calendarRepo repository.CalendarRepository) *CalendarService {
	return &CalendarService{calendarRepo: calendarRepo}
}

func (s *CalendarService) CreateEvent(ctx context.Context, req *entity.CreateCalendarEventRequest, userID *int32) (*entity.CalendarEvent, error) {
	return s.calendarRepo.CreateCalendarEvent(ctx, req, userID)
}

func (s *CalendarService) GetEvent(ctx context.Context, id int32) (*entity.CalendarEvent, error) {
	return s.calendarRepo.GetCalendarEvent(ctx, id)
}

func (s *CalendarService) ListEvents(ctx context.Context) ([]*entity.CalendarEvent, error) {
	return s.calendarRepo.ListCalendarEvents(ctx)
}

func (s *CalendarService) UpdateEvent(ctx context.Context, id int32, req *entity.UpdateCalendarEventRequest) (*entity.CalendarEvent, error) {
	return s.calendarRepo.UpdateCalendarEvent(ctx, id, req)
}

func (s *CalendarService) DeleteEvent(ctx context.Context, id int32) error {
	return s.calendarRepo.DeleteCalendarEvent(ctx, id)
}
