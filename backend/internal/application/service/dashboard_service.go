package service

import (
	"context"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type DashboardService struct {
	dashboardRepo repository.DashboardRepository
}

func NewDashboardService(dashboardRepo repository.DashboardRepository) *DashboardService {
	return &DashboardService{dashboardRepo: dashboardRepo}
}

func (s *DashboardService) GetMetrics(ctx context.Context) (*dto.DashboardMetricsDTO, error) {
	summary, err := s.dashboardRepo.GetSummary(ctx)
	if err != nil {
		return nil, err
	}

	revenueSeries, err := s.dashboardRepo.GetDailyRevenueSeries(ctx)
	if err != nil {
		return nil, err
	}

	ordersBreakdown, err := s.dashboardRepo.GetOrdersStatusBreakdown(ctx)
	if err != nil {
		return nil, err
	}

	topCategories, err := s.dashboardRepo.GetTopSellingCategories(ctx)
	if err != nil {
		return nil, err
	}

	recentOrders, err := s.dashboardRepo.GetRecentOrders(ctx, 5)
	if err != nil {
		return nil, err
	}

	recentTickets, err := s.dashboardRepo.GetRecentTickets(ctx, 5)
	if err != nil {
		return nil, err
	}

	// Format revenue series
	seriesDTO := make([]dto.DailyRevenueDTO, len(revenueSeries))
	for i, item := range revenueSeries {
		seriesDTO[i] = dto.DailyRevenueDTO{
			Date:       item.OrderDate.Format("2006-01-02"),
			OrderCount: item.OrderCount,
			Revenue:    item.Revenue,
		}
	}

	// Format orders breakdown
	ordersDTO := make([]dto.OrderStatusBreakdownDTO, len(ordersBreakdown))
	for i, item := range ordersBreakdown {
		ordersDTO[i] = dto.OrderStatusBreakdownDTO{
			Status:      item.Status,
			Count:       item.Count,
			TotalAmount: item.TotalAmount,
		}
	}

	// Format top categories
	categoriesDTO := make([]dto.TopCategoryDTO, len(topCategories))
	for i, item := range topCategories {
		categoriesDTO[i] = dto.TopCategoryDTO{
			CategoryID:   item.CategoryID,
			CategoryName: item.CategoryName,
			ItemsSold:    item.ItemsSold,
			Revenue:      item.Revenue,
		}
	}

	// Format recent orders
	recentOrdersDTO := make([]dto.RecentOrderDTO, len(recentOrders))
	for i, item := range recentOrders {
		customer := (item.FirstName + " " + item.LastName)
		if customer == " " || customer == "" {
			customer = item.Email
		}
		recentOrdersDTO[i] = dto.RecentOrderDTO{
			ID:        item.ID,
			Customer:  customer,
			Email:     item.Email,
			Total:     item.Total,
			Status:    item.Status,
			CreatedAt: item.CreatedAt,
		}
	}

	// Format recent tickets
	recentTicketsDTO := make([]dto.RecentTicketDTO, len(recentTickets))
	for i, item := range recentTickets {
		customer := (item.UserFirstName + " " + item.UserLastName)
		if customer == " " || customer == "" {
			customer = item.UserEmail
		}
		recentTicketsDTO[i] = dto.RecentTicketDTO{
			ID:        item.ID,
			Subject:   item.Subject,
			Status:    item.Status,
			Priority:  item.Priority,
			Category:  item.Category,
			Customer:  customer,
			Email:     item.UserEmail,
			CreatedAt: item.CreatedAt,
		}
	}

	return &dto.DashboardMetricsDTO{
		Summary: dto.DashboardSummaryDTO{
			TotalRevenue:    summary.TotalRevenue,
			TotalOrders:     summary.TotalOrders,
			PendingOrders:   summary.PendingOrders,
			DeliveredOrders: summary.DeliveredOrders,
			TotalUsers:      summary.TotalUsers,
			ActiveProducts:  summary.ActiveProducts,
			OpenTickets:     summary.OpenTickets,
		},
		RevenueSeries:   seriesDTO,
		OrdersBreakdown: ordersDTO,
		TopCategories:   categoriesDTO,
		RecentOrders:    recentOrdersDTO,
		RecentTickets:   recentTicketsDTO,
	}, nil
}
