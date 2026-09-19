package entity

import "time"

// OrderStatus defines the transactional lifecycle status of an order.
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusPaid      OrderStatus = "paid"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"
)

// Order represents a customer purchase transaction.
type Order struct {
	ID              int64       `json:"id"`
	UserID          *int64      `json:"user_id,omitempty"`
	FirstName       string      `json:"first_name"`
	LastName        string      `json:"last_name"`
	Email           string      `json:"email"`
	TotalAmount     float64     `json:"total_amount"`
	ShippingAddress string      `json:"shipping_address,omitempty"`
	Status          OrderStatus `json:"status"`
	OrderItems      []OrderItem `json:"order_items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

// FullName returns the customer's combined name.
func (o *Order) FullName() string {
	if o.FirstName != "" && o.LastName != "" {
		return o.FirstName + " " + o.LastName
	}
	if o.FirstName != "" {
		return o.FirstName
	}
	return o.LastName
}

// OrderItem represents an individual product line item within an order.
type OrderItem struct {
	ID           int64     `json:"id"`
	OrderID      int64     `json:"order_id"`
	ProductID    *int64    `json:"product_id,omitempty"`
	ProductTitle string    `json:"product_title"`
	Price        float64   `json:"price"`
	Quantity     int64     `json:"quantity"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// DailySalesMetric represents aggregated sales figures by date.
type DailySalesMetric struct {
	SaleDate   string  `json:"sale_date"`
	TotalSales float64 `json:"total_sales"`
	OrderCount int64   `json:"order_count"`
}

// OrderExportRow represents a flattened denormalized row for CSV streaming.
type OrderExportRow struct {
	OrderID         int64
	CustomerName    string
	Email           string
	TotalAmount     float64
	Status          string
	CreatedAt       time.Time
	ProductTitle    string
	ItemPrice       float64
	Quantity        int64
}
