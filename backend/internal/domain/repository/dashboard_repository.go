package repository

import (
	"context"
	"time"
)

type DashboardSummary struct {
	TotalRevenue    float64 `json:"total_revenue"`
	TotalOrders     int32   `json:"total_orders"`
	PendingOrders   int32   `json:"pending_orders"`
	DeliveredOrders int32   `json:"delivered_orders"`
	TotalUsers      int32   `json:"total_users"`
	ActiveProducts  int32   `json:"active_products"`
	OpenTickets     int32   `json:"open_tickets"`
}

type DailyRevenue struct {
	OrderDate  time.Time `json:"order_date"`
	OrderCount int32     `json:"order_count"`
	Revenue    float64   `json:"revenue"`
}

type OrderStatusCount struct {
	Status      string  `json:"status"`
	Count       int32   `json:"count"`
	TotalAmount float64 `json:"total_amount"`
}

type TopCategory struct {
	CategoryID   int64   `json:"category_id"`
	CategoryName string  `json:"category_name"`
	ItemsSold    int32   `json:"items_sold"`
	Revenue      float64 `json:"revenue"`
}

type RecentOrder struct {
	ID        int64     `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Total     float64   `json:"total"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type RecentTicket struct {
	ID            int64     `json:"id"`
	Subject       string    `json:"subject"`
	Status        string    `json:"status"`
	Priority      string    `json:"priority"`
	Category      string    `json:"category"`
	CreatedAt     time.Time `json:"created_at"`
	UserFirstName string    `json:"user_first_name"`
	UserLastName  string    `json:"user_last_name"`
	UserEmail     string    `json:"user_email"`
}

type DashboardRepository interface {
	GetSummary(ctx context.Context) (*DashboardSummary, error)
	GetDailyRevenueSeries(ctx context.Context) ([]*DailyRevenue, error)
	GetOrdersStatusBreakdown(ctx context.Context) ([]*OrderStatusCount, error)
	GetTopSellingCategories(ctx context.Context) ([]*TopCategory, error)
	GetRecentOrders(ctx context.Context, limit int32) ([]*RecentOrder, error)
	GetRecentTickets(ctx context.Context, limit int32) ([]*RecentTicket, error)
}
