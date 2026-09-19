package repository

import (
	"context"

	domainRepo "github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type DashboardRepositorySQLC struct {
	queries *sqlc.Queries
}

func NewDashboardRepositorySQLC(queries *sqlc.Queries) domainRepo.DashboardRepository {
	return &DashboardRepositorySQLC{queries: queries}
}

func (r *DashboardRepositorySQLC) GetSummary(ctx context.Context) (*domainRepo.DashboardSummary, error) {
	row, err := r.queries.GetDashboardSummary(ctx)
	if err != nil {
		return nil, err
	}

	return &domainRepo.DashboardSummary{
		TotalRevenue:    row.TotalRevenue,
		TotalOrders:     row.TotalOrders,
		PendingOrders:   row.PendingOrders,
		DeliveredOrders: row.DeliveredOrders,
		TotalUsers:      row.TotalUsers,
		ActiveProducts:  row.ActiveProducts,
		OpenTickets:     row.OpenTickets,
	}, nil
}

func (r *DashboardRepositorySQLC) GetDailyRevenueSeries(ctx context.Context) ([]*domainRepo.DailyRevenue, error) {
	rows, err := r.queries.GetDailyRevenueSeries(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*domainRepo.DailyRevenue, len(rows))
	for i, row := range rows {
		result[i] = &domainRepo.DailyRevenue{
			OrderDate:  row.OrderDate.Time,
			OrderCount: row.OrderCount,
			Revenue:    row.Revenue,
		}
	}

	return result, nil
}

func (r *DashboardRepositorySQLC) GetOrdersStatusBreakdown(ctx context.Context) ([]*domainRepo.OrderStatusCount, error) {
	rows, err := r.queries.GetOrdersStatusBreakdown(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*domainRepo.OrderStatusCount, len(rows))
	for i, row := range rows {
		result[i] = &domainRepo.OrderStatusCount{
			Status:      row.Status,
			Count:       row.Count,
			TotalAmount: row.TotalAmount,
		}
	}

	return result, nil
}

func (r *DashboardRepositorySQLC) GetTopSellingCategories(ctx context.Context) ([]*domainRepo.TopCategory, error) {
	rows, err := r.queries.GetTopSellingCategories(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*domainRepo.TopCategory, len(rows))
	for i, row := range rows {
		result[i] = &domainRepo.TopCategory{
			CategoryID:   row.CategoryID,
			CategoryName: row.CategoryName,
			ItemsSold:    row.ItemsSold,
			Revenue:      row.Revenue,
		}
	}

	return result, nil
}

func (r *DashboardRepositorySQLC) GetRecentOrders(ctx context.Context, limit int32) ([]*domainRepo.RecentOrder, error) {
	if limit <= 0 {
		limit = 5
	}

	rows, err := r.queries.GetRecentOrdersForDashboard(ctx, limit)
	if err != nil {
		return nil, err
	}

	result := make([]*domainRepo.RecentOrder, len(rows))
	for i, row := range rows {
		var total float64
		if row.TotalAmount.Valid {
			f, _ := row.TotalAmount.Float64Value()
			if f.Valid {
				total = f.Float64
			}
		}

		result[i] = &domainRepo.RecentOrder{
			ID:        row.ID,
			FirstName: row.FirstName.String,
			LastName:  row.LastName.String,
			Email:     row.Email.String,
			Total:     total,
			Status:    row.Status,
			CreatedAt: row.CreatedAt.Time,
		}
	}

	return result, nil
}

func (r *DashboardRepositorySQLC) GetRecentTickets(ctx context.Context, limit int32) ([]*domainRepo.RecentTicket, error) {
	if limit <= 0 {
		limit = 5
	}

	rows, err := r.queries.GetRecentTicketsForDashboard(ctx, limit)
	if err != nil {
		return nil, err
	}

	result := make([]*domainRepo.RecentTicket, len(rows))
	for i, row := range rows {
		result[i] = &domainRepo.RecentTicket{
			ID:            row.ID,
			Subject:       row.Subject,
			Status:        row.Status,
			Priority:      row.Priority,
			Category:      row.Category,
			CreatedAt:     row.CreatedAt.Time,
			UserFirstName: row.UserFirstName.String,
			UserLastName:  row.UserLastName.String,
			UserEmail:     row.UserEmail,
		}
	}

	return result, nil
}
