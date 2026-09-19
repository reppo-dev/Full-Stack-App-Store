package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

type TicketRepository interface {
	Create(ctx context.Context, ticket *entity.Ticket) (*entity.Ticket, error)
	GetByID(ctx context.Context, id int64) (*entity.Ticket, error)
	ListByUserID(ctx context.Context, userID int64, limit, offset int32) ([]*entity.Ticket, int64, error)
	ListAll(ctx context.Context, status, priority string, limit, offset int32) ([]*entity.Ticket, int64, error)
	UpdateStatus(ctx context.Context, id int64, status entity.TicketStatus) (*entity.Ticket, error)
	Assign(ctx context.Context, id int64, assignedTo int64) (*entity.Ticket, error)
	CreateMessage(ctx context.Context, msg *entity.TicketMessage) (*entity.TicketMessage, error)
	ListMessagesByTicketID(ctx context.Context, ticketID int64) ([]*entity.TicketMessage, error)
	CountUnresolved(ctx context.Context) (int64, error)
}
