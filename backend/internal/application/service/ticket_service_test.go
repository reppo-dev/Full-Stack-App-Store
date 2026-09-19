package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
)

type mockTicketRepo struct {
	tickets  []*entity.Ticket
	messages []*entity.TicketMessage
	nextID   int64
}

func newMockTicketRepo() *mockTicketRepo {
	return &mockTicketRepo{
		tickets:  []*entity.Ticket{},
		messages: []*entity.TicketMessage{},
		nextID:   1,
	}
}

func (m *mockTicketRepo) Create(ctx context.Context, t *entity.Ticket) (*entity.Ticket, error) {
	created := *t
	created.ID = m.nextID
	created.CreatedAt = time.Now()
	created.UpdatedAt = time.Now()
	m.nextID++
	m.tickets = append(m.tickets, &created)
	return &created, nil
}

func (m *mockTicketRepo) GetByID(ctx context.Context, id int64) (*entity.Ticket, error) {
	for _, t := range m.tickets {
		if t.ID == id {
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (m *mockTicketRepo) ListByUserID(ctx context.Context, userID int64, limit, offset int32) ([]*entity.Ticket, int64, error) {
	var userTickets []*entity.Ticket
	for _, t := range m.tickets {
		if t.UserID == userID {
			userTickets = append(userTickets, t)
		}
	}
	return userTickets, int64(len(userTickets)), nil
}

func (m *mockTicketRepo) ListAll(ctx context.Context, status, priority string, limit, offset int32) ([]*entity.Ticket, int64, error) {
	var filtered []*entity.Ticket
	for _, t := range m.tickets {
		if (status == "" || string(t.Status) == status) && (priority == "" || string(t.Priority) == priority) {
			filtered = append(filtered, t)
		}
	}
	return filtered, int64(len(filtered)), nil
}

func (m *mockTicketRepo) UpdateStatus(ctx context.Context, id int64, status entity.TicketStatus) (*entity.Ticket, error) {
	for _, t := range m.tickets {
		if t.ID == id {
			t.Status = status
			t.UpdatedAt = time.Now()
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (m *mockTicketRepo) Assign(ctx context.Context, id int64, assignedTo int64) (*entity.Ticket, error) {
	for _, t := range m.tickets {
		if t.ID == id {
			t.AssignedTo = &assignedTo
			t.UpdatedAt = time.Now()
			return t, nil
		}
	}
	return nil, domain.ErrTicketNotFound
}

func (m *mockTicketRepo) CreateMessage(ctx context.Context, msg *entity.TicketMessage) (*entity.TicketMessage, error) {
	created := *msg
	created.ID = int64(len(m.messages) + 1)
	created.CreatedAt = time.Now()
	m.messages = append(m.messages, &created)
	return &created, nil
}

func (m *mockTicketRepo) ListMessagesByTicketID(ctx context.Context, ticketID int64) ([]*entity.TicketMessage, error) {
	var msgs []*entity.TicketMessage
	for _, msg := range m.messages {
		if msg.TicketID == ticketID {
			msgs = append(msgs, msg)
		}
	}
	return msgs, nil
}

func (m *mockTicketRepo) CountUnresolved(ctx context.Context) (int64, error) {
	var count int64
	for _, t := range m.tickets {
		if t.Status == entity.TicketStatusOpen || t.Status == entity.TicketStatusInProgress {
			count++
		}
	}
	return count, nil
}

func TestTicketService(t *testing.T) {
	repo := newMockTicketRepo()
	svc := service.NewTicketService(repo)
	ctx := context.Background()

	t.Run("CreateTicket_Success", func(t *testing.T) {
		ticket, err := svc.CreateTicket(ctx, 1, dto.CreateTicketDTO{
			Subject:        "Payment issue",
			Priority:       entity.TicketPriorityHigh,
			Category:       "billing",
			InitialMessage: "I was charged twice.",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if ticket.ID != 1 {
			t.Errorf("expected ID 1, got %d", ticket.ID)
		}
		if ticket.Status != entity.TicketStatusOpen {
			t.Errorf("expected status open, got %s", ticket.Status)
		}
		if ticket.Priority != entity.TicketPriorityHigh {
			t.Errorf("expected priority high, got %s", ticket.Priority)
		}
	})

	t.Run("GetTicket_CustomerAccessControl", func(t *testing.T) {
		// Ticket 1 belongs to user 1
		_, err := svc.GetTicket(ctx, 1, 2, false) // user 2 tries to access
		if err != domain.ErrUnauthorizedTicketAccess {
			t.Fatalf("expected ErrUnauthorizedTicketAccess, got %v", err)
		}

		// Owner can access
		ticket, err := svc.GetTicket(ctx, 1, 1, false)
		if err != nil {
			t.Fatalf("owner access failed: %v", err)
		}
		if len(ticket.Messages) != 1 {
			t.Errorf("expected 1 message, got %d", len(ticket.Messages))
		}

		// Admin can access
		adminView, err := svc.GetTicket(ctx, 1, 999, true)
		if err != nil {
			t.Fatalf("admin access failed: %v", err)
		}
		if adminView.ID != 1 {
			t.Errorf("expected ID 1, got %d", adminView.ID)
		}
	})

	t.Run("AddMessage_And_InternalNoteFiltering", func(t *testing.T) {
		// Admin adds an internal note
		_, err := svc.AddMessage(ctx, 1, 999, true, dto.CreateTicketMessageDTO{
			Message:    "Internal note: investigating with Stripe.",
			IsInternal: true,
		})
		if err != nil {
			t.Fatalf("admin message failed: %v", err)
		}

		// Customer view should NOT see the internal note
		customerView, err := svc.GetTicket(ctx, 1, 1, false)
		if err != nil {
			t.Fatalf("customer view failed: %v", err)
		}
		if len(customerView.Messages) != 1 {
			t.Errorf("expected customer to see only 1 message, got %d", len(customerView.Messages))
		}

		// Admin view SHOULD see both messages
		adminView, err := svc.GetTicket(ctx, 1, 999, true)
		if err != nil {
			t.Fatalf("admin view failed: %v", err)
		}
		if len(adminView.Messages) != 2 {
			t.Errorf("expected admin to see 2 messages, got %d", len(adminView.Messages))
		}
	})

	t.Run("StatusTransition_Lifecycle", func(t *testing.T) {
		// Admin resolves ticket
		updated, err := svc.UpdateStatus(ctx, 1, 999, true, entity.TicketStatusResolved)
		if err != nil {
			t.Fatalf("resolve failed: %v", err)
		}
		if updated.Status != entity.TicketStatusResolved {
			t.Errorf("expected resolved, got %s", updated.Status)
		}

		// Customer replies -> ticket automatically reopens to in_progress
		_, err = svc.AddMessage(ctx, 1, 1, false, dto.CreateTicketMessageDTO{
			Message: "Still having this issue.",
		})
		if err != nil {
			t.Fatalf("customer reply failed: %v", err)
		}

		refreshed, _ := svc.GetTicket(ctx, 1, 1, false)
		if refreshed.Status != entity.TicketStatusInProgress {
			t.Errorf("expected in_progress after customer reply, got %s", refreshed.Status)
		}
	})
}
