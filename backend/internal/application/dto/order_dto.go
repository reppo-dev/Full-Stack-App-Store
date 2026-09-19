package dto

import (
	"time"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// CreateOrderItemDTO represents input payload for an individual order item.
type CreateOrderItemDTO struct {
	ProductID    *int64  `json:"product_id"`
	ProductTitle string  `json:"product_title"`
	Price        float64 `json:"price"`
	Quantity     int64   `json:"quantity"`
}

// CreateOrderDTO represents checkout request payload.
type CreateOrderDTO struct {
	FirstName       string               `json:"first_name"`
	LastName        string               `json:"last_name"`
	Email           string               `json:"email"`
	ShippingAddress string               `json:"shipping_address"`
	Items           []CreateOrderItemDTO `json:"items"`
}

// OrderItemViewDTO represents serialized response for an order line item.
type OrderItemViewDTO struct {
	ID           int64   `json:"id"`
	ProductID    *int64  `json:"product_id,omitempty"`
	ProductTitle string  `json:"product_title"`
	Price        float64 `json:"price"`
	Quantity     int64   `json:"quantity"`
}

// OrderViewDTO represents serialized order data with dual legacy/modern field names.
type OrderViewDTO struct {
	ID              int64              `json:"id"`
	UserID          *int64             `json:"user_id,omitempty"`
	CustomerName    string             `json:"name"`
	FirstName       string             `json:"first_name"`
	LastName        string             `json:"last_name"`
	Email           string             `json:"email"`
	TotalAmount     float64            `json:"total"`
	ShippingAddress string             `json:"shipping_address,omitempty"`
	Status          entity.OrderStatus `json:"status"`
	OrderItems      []OrderItemViewDTO `json:"order_items"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

// OrderPaginationDTO wraps paginated order results.
type OrderPaginationDTO struct {
	Data     []OrderViewDTO `json:"data"`
	Total    int64          `json:"total"`
	Page     int32          `json:"page"`
	LastPage int32          `json:"last_page"`
}

// UpdateOrderStatusDTO represents payload for status updates.
type UpdateOrderStatusDTO struct {
	Status entity.OrderStatus `json:"status"`
}
