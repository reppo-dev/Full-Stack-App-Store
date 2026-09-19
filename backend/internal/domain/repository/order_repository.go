package repository

import (
	"context"

	"github.com/reppo/go-backend/internal/domain/entity"
)

// CreateOrderItemParams holds input data for a single order line item.
type CreateOrderItemParams struct {
	ProductID    *int64
	ProductTitle string
	Price        float64
	Quantity     int64
}

// CreateOrderParams holds input data for initiating an order.
type CreateOrderParams struct {
	UserID          *int64
	FirstName       string
	LastName        string
	Email           string
	TotalAmount     float64
	ShippingAddress string
	Status          entity.OrderStatus
	Items           []CreateOrderItemParams
}

// OrderListParams encapsulates pagination parameters for admin order lists.
type OrderListParams struct {
	Limit  int32
	Offset int32
}

// OrderRepository defines the persistence and transaction contract for commerce orders.
type OrderRepository interface {
	CreateOrderAtomic(ctx context.Context, params CreateOrderParams) (*entity.Order, error)
	GetByID(ctx context.Context, id int64) (*entity.Order, error)
	ListByUserID(ctx context.Context, userID int64) ([]*entity.Order, error)
	ListAll(ctx context.Context, params OrderListParams) ([]*entity.Order, error)
	Count(ctx context.Context) (int64, error)
	UpdateStatus(ctx context.Context, id int64, status entity.OrderStatus) (*entity.Order, error)
	GetDailySales(ctx context.Context) ([]entity.DailySalesMetric, error)
	GetAllForExport(ctx context.Context) ([]entity.OrderExportRow, error)
}
