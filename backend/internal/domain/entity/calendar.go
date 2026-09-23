package entity

import (
	"time"
)

type CalendarEvent struct {
	ID          int32      `json:"id"`
	Title       string     `json:"title"`
	Description *string    `json:"description,omitempty"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	Type        string     `json:"type"`
	Color       string     `json:"color"`
	Address     *string    `json:"address,omitempty"`
	CreatedBy   *int32     `json:"created_by,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CreateCalendarEventRequest struct {
	Title       string     `json:"title" validate:"required"`
	Description *string    `json:"description,omitempty"`
	StartDate   time.Time  `json:"start_date" validate:"required"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	Type        string     `json:"type" validate:"required"`
	Color       string     `json:"color" validate:"required"`
	Address     *string    `json:"address,omitempty"`
}

type UpdateCalendarEventRequest struct {
	Title       *string    `json:"title,omitempty"`
	Description *string    `json:"description,omitempty"`
	StartDate   *time.Time `json:"start_date,omitempty"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	Type        *string    `json:"type,omitempty"`
	Color       *string    `json:"color,omitempty"`
	Address     *string    `json:"address,omitempty"`
}
