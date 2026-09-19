package dto

import (
	"time"

	"github.com/reppo/go-backend/internal/domain/entity"
)

type CreateTicketDTO struct {
	Subject        string                `json:"subject"`
	Priority       entity.TicketPriority `json:"priority"`
	Category       string                `json:"category"`
	InitialMessage string                `json:"initial_message"`
}

type UpdateTicketStatusDTO struct {
	Status entity.TicketStatus `json:"status"`
}

type AssignTicketDTO struct {
	AssignedTo int64 `json:"assigned_to"`
}

type CreateTicketMessageDTO struct {
	Message    string `json:"message"`
	IsInternal bool   `json:"is_internal"`
}

type TicketMessageViewDTO struct {
	ID              int64     `json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	TicketID        int64     `json:"ticket_id"`
	SenderID        int64     `json:"sender_id"`
	Message         string    `json:"message"`
	IsInternal      bool      `json:"is_internal"`
	SenderFirstName string    `json:"sender_first_name,omitempty"`
	SenderLastName  string    `json:"sender_last_name,omitempty"`
	SenderEmail     string    `json:"sender_email,omitempty"`
	SenderImage     string    `json:"sender_image,omitempty"`
	SenderRole      string    `json:"sender_role,omitempty"`
}

type TicketViewDTO struct {
	ID                int64                  `json:"id"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	UserID            int64                  `json:"user_id"`
	Subject           string                 `json:"subject"`
	Status            entity.TicketStatus    `json:"status"`
	Priority          entity.TicketPriority  `json:"priority"`
	Category          string                 `json:"category"`
	AssignedTo        *int64                 `json:"assigned_to,omitempty"`
	UserFirstName     string                 `json:"user_first_name,omitempty"`
	UserLastName      string                 `json:"user_last_name,omitempty"`
	UserEmail         string                 `json:"user_email,omitempty"`
	AssignedFirstName string                 `json:"assigned_first_name,omitempty"`
	AssignedLastName  string                 `json:"assigned_last_name,omitempty"`
	MessageCount      int64                  `json:"message_count"`
	Messages          []TicketMessageViewDTO `json:"messages,omitempty"`
}

type TicketPaginationDTO struct {
	Data     []TicketViewDTO `json:"data"`
	Total    int64           `json:"total"`
	Page     int32           `json:"page"`
	LastPage int32           `json:"last_page"`
}
