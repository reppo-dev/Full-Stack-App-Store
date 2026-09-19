package entity

import "time"

type TicketStatus string

const (
	TicketStatusOpen       TicketStatus = "open"
	TicketStatusInProgress TicketStatus = "in_progress"
	TicketStatusResolved   TicketStatus = "resolved"
	TicketStatusClosed     TicketStatus = "closed"
)

func (s TicketStatus) IsValid() bool {
	switch s {
	case TicketStatusOpen, TicketStatusInProgress, TicketStatusResolved, TicketStatusClosed:
		return true
	default:
		return false
	}
}

type TicketPriority string

const (
	TicketPriorityLow    TicketPriority = "low"
	TicketPriorityMedium TicketPriority = "medium"
	TicketPriorityHigh   TicketPriority = "high"
	TicketPriorityUrgent TicketPriority = "urgent"
)

func (p TicketPriority) IsValid() bool {
	switch p {
	case TicketPriorityLow, TicketPriorityMedium, TicketPriorityHigh, TicketPriorityUrgent:
		return true
	default:
		return false
	}
}

type Ticket struct {
	ID                int64          `json:"id"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	UserID            int64          `json:"user_id"`
	Subject           string         `json:"subject"`
	Status            TicketStatus   `json:"status"`
	Priority          TicketPriority `json:"priority"`
	Category          string         `json:"category"`
	AssignedTo        *int64         `json:"assigned_to,omitempty"`
	UserFirstName     string         `json:"user_first_name,omitempty"`
	UserLastName      string         `json:"user_last_name,omitempty"`
	UserEmail         string         `json:"user_email,omitempty"`
	AssignedFirstName string         `json:"assigned_first_name,omitempty"`
	AssignedLastName  string         `json:"assigned_last_name,omitempty"`
	MessageCount      int64          `json:"message_count"`
	Messages          []TicketMessage `json:"messages,omitempty"`
}

type TicketMessage struct {
	ID              int64              `json:"id"`
	CreatedAt       time.Time          `json:"created_at"`
	TicketID        int64              `json:"ticket_id"`
	SenderID        int64              `json:"sender_id"`
	Message         string             `json:"message"`
	IsInternal      bool               `json:"is_internal"`
	SenderFirstName string             `json:"sender_first_name,omitempty"`
	SenderLastName  string             `json:"sender_last_name,omitempty"`
	SenderEmail     string             `json:"sender_email,omitempty"`
	SenderImage     string             `json:"sender_image,omitempty"`
	SenderRole      string             `json:"sender_role,omitempty"`
	Attachments     []TicketAttachment `json:"attachments,omitempty"`
}

type TicketAttachment struct {
	ID              int64     `json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	TicketMessageID int64     `json:"ticket_message_id"`
	FileName        string    `json:"file_name"`
	FileURL         string    `json:"file_url"`
	FileSize        int64     `json:"file_size"`
}
