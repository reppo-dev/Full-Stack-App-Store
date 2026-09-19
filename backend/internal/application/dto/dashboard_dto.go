package dto

import "time"

type DailyRevenueDTO struct {
	Date       string  `json:"date"`
	OrderCount int32   `json:"order_count"`
	Revenue    float64 `json:"revenue"`
}

type OrderStatusBreakdownDTO struct {
	Status      string  `json:"status"`
	Count       int32   `json:"count"`
	TotalAmount float64 `json:"total_amount"`
}

type TopCategoryDTO struct {
	CategoryID   int64   `json:"category_id"`
	CategoryName string  `json:"category_name"`
	ItemsSold    int32   `json:"items_sold"`
	Revenue      float64 `json:"revenue"`
}

type RecentOrderDTO struct {
	ID        int64     `json:"id"`
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	Total     float64   `json:"total"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type RecentTicketDTO struct {
	ID        int64     `json:"id"`
	Subject   string    `json:"subject"`
	Status    string    `json:"status"`
	Priority  string    `json:"priority"`
	Category  string    `json:"category"`
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardSummaryDTO struct {
	TotalRevenue    float64 `json:"total_revenue"`
	TotalOrders     int32   `json:"total_orders"`
	PendingOrders   int32   `json:"pending_orders"`
	DeliveredOrders int32   `json:"delivered_orders"`
	TotalUsers      int32   `json:"total_users"`
	ActiveProducts  int32   `json:"active_products"`
	OpenTickets     int32   `json:"open_tickets"`
}

type DashboardMetricsDTO struct {
	Summary         DashboardSummaryDTO       `json:"summary"`
	RevenueSeries   []DailyRevenueDTO         `json:"revenue_series"`
	OrdersBreakdown []OrderStatusBreakdownDTO `json:"orders_breakdown"`
	TopCategories   []TopCategoryDTO          `json:"top_categories"`
	RecentOrders    []RecentOrderDTO          `json:"recent_orders"`
	RecentTickets   []RecentTicketDTO         `json:"recent_tickets"`
}
