package service

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

// OrderService orchestrates commerce transactions, customer checkouts, and admin fulfillment.
type OrderService struct {
	orderRepo repository.OrderRepository
}

// NewOrderService constructs a new OrderService instance.
func NewOrderService(orderRepo repository.OrderRepository) *OrderService {
	return &OrderService{orderRepo: orderRepo}
}

// CreateOrder processes an atomic checkout transaction with inventory validation.
func (s *OrderService) CreateOrder(ctx context.Context, userID *int64, input dto.CreateOrderDTO) (*dto.OrderViewDTO, error) {
	if len(input.Items) == 0 {
		return nil, domain.ErrEmptyOrderItems
	}

	var totalAmount float64
	itemsParams := make([]repository.CreateOrderItemParams, len(input.Items))
	for i, item := range input.Items {
		if strings.TrimSpace(item.ProductTitle) == "" {
			return nil, errors.New("product title is required for each order item")
		}
		if item.Price < 0 {
			return nil, errors.New("item price cannot be negative")
		}
		if item.Quantity <= 0 {
			return nil, errors.New("item quantity must be at least 1")
		}

		lineTotal := item.Price * float64(item.Quantity)
		totalAmount += lineTotal

		itemsParams[i] = repository.CreateOrderItemParams{
			ProductID:    item.ProductID,
			ProductTitle: item.ProductTitle,
			Price:        item.Price,
			Quantity:     item.Quantity,
		}
	}

	params := repository.CreateOrderParams{
		UserID:          userID,
		FirstName:       input.FirstName,
		LastName:        input.LastName,
		Email:           input.Email,
		TotalAmount:     totalAmount,
		ShippingAddress: input.ShippingAddress,
		Status:          entity.OrderStatusPending,
		Items:           itemsParams,
	}

	createdOrder, err := s.orderRepo.CreateOrderAtomic(ctx, params)
	if err != nil {
		return nil, err
	}

	view := toOrderViewDTO(createdOrder)
	return &view, nil
}

// GetOrderByID retrieves an order, enforcing owner security checks.
func (s *OrderService) GetOrderByID(ctx context.Context, id int64, requestingUserID *int64, isAdmin bool) (*dto.OrderViewDTO, error) {
	if id <= 0 {
		return nil, errors.New("invalid order ID")
	}

	order, err := s.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if !isAdmin {
		if requestingUserID == nil || order.UserID == nil || *order.UserID != *requestingUserID {
			return nil, domain.ErrForbidden
		}
	}

	view := toOrderViewDTO(order)
	return &view, nil
}

// ListUserOrders returns all historical orders for a specific authenticated customer.
func (s *OrderService) ListUserOrders(ctx context.Context, userID int64) ([]dto.OrderViewDTO, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	orders, err := s.orderRepo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	views := make([]dto.OrderViewDTO, len(orders))
	for i, o := range orders {
		views[i] = toOrderViewDTO(o)
	}

	return views, nil
}

// ListAllOrders returns a paginated list of all system orders (admin only).
func (s *OrderService) ListAllOrders(ctx context.Context, page, pageSize int32) (*dto.OrderPaginationDTO, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 15
	}

	offset := (page - 1) * pageSize
	params := repository.OrderListParams{
		Limit:  pageSize,
		Offset: offset,
	}

	orders, err := s.orderRepo.ListAll(ctx, params)
	if err != nil {
		return nil, err
	}

	total, err := s.orderRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	lastPage := int32(math.Ceil(float64(total) / float64(pageSize)))
	if lastPage < 1 {
		lastPage = 1
	}

	views := make([]dto.OrderViewDTO, len(orders))
	for i, o := range orders {
		views[i] = toOrderViewDTO(o)
	}

	return &dto.OrderPaginationDTO{
		Data:     views,
		Total:    total,
		Page:     page,
		LastPage: lastPage,
	}, nil
}

// UpdateStatus changes the order's fulfillment state.
func (s *OrderService) UpdateStatus(ctx context.Context, id int64, status entity.OrderStatus) (*dto.OrderViewDTO, error) {
	if id <= 0 {
		return nil, errors.New("invalid order ID")
	}

	switch status {
	case entity.OrderStatusPending, entity.OrderStatusPaid, entity.OrderStatusShipped,
		entity.OrderStatusDelivered, entity.OrderStatusCancelled:
	default:
		return nil, domain.ErrInvalidOrderStatus
	}

	updated, err := s.orderRepo.UpdateStatus(ctx, id, status)
	if err != nil {
		return nil, err
	}

	view := toOrderViewDTO(updated)
	return &view, nil
}

// ExportOrdersCSV creates an in-memory CSV export buffer without filesystem dependencies.
func (s *OrderService) ExportOrdersCSV(ctx context.Context) ([]byte, error) {
	rows, err := s.orderRepo.GetAllForExport(ctx)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	header := []string{
		"Order ID", "Customer Name", "Email", "Total Amount", "Status", "Order Date",
		"Product Title", "Item Price", "Quantity",
	}
	if err := writer.Write(header); err != nil {
		return nil, err
	}

	for _, r := range rows {
		record := []string{
			strconv.FormatInt(r.OrderID, 10),
			r.CustomerName,
			r.Email,
			fmt.Sprintf("%.2f", r.TotalAmount),
			r.Status,
			r.CreatedAt.Format("2006-01-02 15:04:05"),
			r.ProductTitle,
			fmt.Sprintf("%.2f", r.ItemPrice),
			strconv.FormatInt(r.Quantity, 10),
		}
		if err := writer.Write(record); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// GetSalesChart retrieves aggregated analytical sales metrics.
func (s *OrderService) GetSalesChart(ctx context.Context) ([]entity.DailySalesMetric, error) {
	return s.orderRepo.GetDailySales(ctx)
}

func toOrderViewDTO(o *entity.Order) dto.OrderViewDTO {
	items := make([]dto.OrderItemViewDTO, len(o.OrderItems))
	for i, it := range o.OrderItems {
		items[i] = dto.OrderItemViewDTO{
			ID:           it.ID,
			ProductID:    it.ProductID,
			ProductTitle: it.ProductTitle,
			Price:        it.Price,
			Quantity:     it.Quantity,
		}
	}

	return dto.OrderViewDTO{
		ID:              o.ID,
		UserID:          o.UserID,
		CustomerName:    o.FullName(),
		FirstName:       o.FirstName,
		LastName:        o.LastName,
		Email:           o.Email,
		TotalAmount:     o.TotalAmount,
		ShippingAddress: o.ShippingAddress,
		Status:          o.Status,
		OrderItems:      items,
		CreatedAt:       o.CreatedAt,
		UpdatedAt:       o.UpdatedAt,
	}
}
