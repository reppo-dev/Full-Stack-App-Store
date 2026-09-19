package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/application/service"
	domainRepo "github.com/reppo/go-backend/internal/domain/repository"
)

type mockDashboardRepo struct{}

func (m *mockDashboardRepo) GetSummary(ctx context.Context) (*domainRepo.DashboardSummary, error) {
	return &domainRepo.DashboardSummary{
		TotalRevenue:    12500.50,
		TotalOrders:     42,
		PendingOrders:   5,
		DeliveredOrders: 35,
		TotalUsers:      120,
		ActiveProducts:  64,
		OpenTickets:     3,
	}, nil
}

func (m *mockDashboardRepo) GetDailyRevenueSeries(ctx context.Context) ([]*domainRepo.DailyRevenue, error) {
	return []*domainRepo.DailyRevenue{
		{
			OrderDate:  time.Date(2026, 9, 18, 0, 0, 0, 0, time.UTC),
			OrderCount: 4,
			Revenue:    850.00,
		},
		{
			OrderDate:  time.Date(2026, 9, 19, 0, 0, 0, 0, time.UTC),
			OrderCount: 6,
			Revenue:    1200.50,
		},
	}, nil
}

func (m *mockDashboardRepo) GetOrdersStatusBreakdown(ctx context.Context) ([]*domainRepo.OrderStatusCount, error) {
	return []*domainRepo.OrderStatusCount{
		{Status: "delivered", Count: 35, TotalAmount: 10500.00},
		{Status: "pending", Count: 5, TotalAmount: 1500.00},
		{Status: "cancelled", Count: 2, TotalAmount: 500.50},
	}, nil
}

func (m *mockDashboardRepo) GetTopSellingCategories(ctx context.Context) ([]*domainRepo.TopCategory, error) {
	return []*domainRepo.TopCategory{
		{CategoryID: 1, CategoryName: "Electronics", ItemsSold: 80, Revenue: 8000.00},
		{CategoryID: 2, CategoryName: "Accessories", ItemsSold: 30, Revenue: 2500.00},
	}, nil
}

func (m *mockDashboardRepo) GetRecentOrders(ctx context.Context, limit int32) ([]*domainRepo.RecentOrder, error) {
	return []*domainRepo.RecentOrder{
		{
			ID:        101,
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john@example.com",
			Total:     250.00,
			Status:    "delivered",
			CreatedAt: time.Now(),
		},
	}, nil
}

func (m *mockDashboardRepo) GetRecentTickets(ctx context.Context, limit int32) ([]*domainRepo.RecentTicket, error) {
	return []*domainRepo.RecentTicket{
		{
			ID:            1,
			Subject:       "Need help with checkout",
			Status:        "open",
			Priority:      "high",
			Category:      "billing",
			CreatedAt:     time.Now(),
			UserFirstName: "Jane",
			UserLastName:  "Smith",
			UserEmail:     "jane@example.com",
		},
	}, nil
}

func TestDashboardService_GetMetrics(t *testing.T) {
	svc := service.NewDashboardService(&mockDashboardRepo{})
	ctx := context.Background()

	metrics, err := svc.GetMetrics(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if metrics.Summary.TotalRevenue != 12500.50 {
		t.Errorf("expected TotalRevenue 12500.50, got %f", metrics.Summary.TotalRevenue)
	}
	if metrics.Summary.TotalOrders != 42 {
		t.Errorf("expected TotalOrders 42, got %d", metrics.Summary.TotalOrders)
	}
	if len(metrics.RevenueSeries) != 2 {
		t.Errorf("expected 2 revenue items, got %d", len(metrics.RevenueSeries))
	}
	if metrics.RevenueSeries[0].Date != "2026-09-18" {
		t.Errorf("expected date 2026-09-18, got %s", metrics.RevenueSeries[0].Date)
	}
	if len(metrics.TopCategories) != 2 {
		t.Errorf("expected 2 categories, got %d", len(metrics.TopCategories))
	}
	if len(metrics.RecentOrders) != 1 {
		t.Errorf("expected 1 recent order, got %d", len(metrics.RecentOrders))
	}
	if metrics.RecentOrders[0].Customer != "John Doe" {
		t.Errorf("expected customer 'John Doe', got %s", metrics.RecentOrders[0].Customer)
	}
	if len(metrics.RecentTickets) != 1 {
		t.Errorf("expected 1 recent ticket, got %d", len(metrics.RecentTickets))
	}
}
