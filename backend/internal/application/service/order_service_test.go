package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain/entity"
	domainRepo "github.com/reppo/go-backend/internal/domain/repository"
)

type mockOrderRepo struct {
	orders []*entity.Order
	nextID int64
}

func newMockOrderRepo() *mockOrderRepo {
	return &mockOrderRepo{
		orders: []*entity.Order{},
		nextID: 1,
	}
}

func (m *mockOrderRepo) CreateOrderAtomic(ctx context.Context, params domainRepo.CreateOrderParams) (*entity.Order, error) {
	items := make([]entity.OrderItem, len(params.Items))
	for i, it := range params.Items {
		items[i] = entity.OrderItem{
			ID:           int64(i + 1),
			OrderID:      m.nextID,
			ProductID:    it.ProductID,
			ProductTitle: it.ProductTitle,
			Price:        it.Price,
			Quantity:     it.Quantity,
			CreatedAt:    time.Now(),
		}
	}

	order := &entity.Order{
		ID:              m.nextID,
		UserID:          params.UserID,
		FirstName:       params.FirstName,
		LastName:        params.LastName,
		Email:           params.Email,
		TotalAmount:     params.TotalAmount,
		ShippingAddress: params.ShippingAddress,
		Status:          params.Status,
		OrderItems:      items,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	m.nextID++
	m.orders = append(m.orders, order)
	return order, nil
}

func (m *mockOrderRepo) GetByID(ctx context.Context, id int64) (*entity.Order, error) {
	for _, o := range m.orders {
		if o.ID == id {
			return o, nil
		}
	}
	return nil, nil
}

func (m *mockOrderRepo) ListByUserID(ctx context.Context, userID int64) ([]*entity.Order, error) {
	var list []*entity.Order
	for _, o := range m.orders {
		if o.UserID != nil && *o.UserID == userID {
			list = append(list, o)
		}
	}
	return list, nil
}

func (m *mockOrderRepo) ListAll(ctx context.Context, params domainRepo.OrderListParams) ([]*entity.Order, error) {
	return m.orders, nil
}

func (m *mockOrderRepo) Count(ctx context.Context) (int64, error) {
	return int64(len(m.orders)), nil
}

func (m *mockOrderRepo) UpdateStatus(ctx context.Context, id int64, status entity.OrderStatus) (*entity.Order, error) {
	for _, o := range m.orders {
		if o.ID == id {
			o.Status = status
			return o, nil
		}
	}
	return nil, nil
}

func (m *mockOrderRepo) GetDailySales(ctx context.Context) ([]entity.DailySalesMetric, error) {
	return []entity.DailySalesMetric{
		{SaleDate: "2026-09-19", TotalSales: 299.99, OrderCount: 1},
	}, nil
}

func (m *mockOrderRepo) GetAllForExport(ctx context.Context) ([]entity.OrderExportRow, error) {
	var rows []entity.OrderExportRow
	for _, o := range m.orders {
		for _, it := range o.OrderItems {
			rows = append(rows, entity.OrderExportRow{
				OrderID:      o.ID,
				CustomerName: o.FullName(),
				Email:        o.Email,
				TotalAmount:  o.TotalAmount,
				Status:       string(o.Status),
				CreatedAt:    o.CreatedAt,
				ProductTitle: it.ProductTitle,
				ItemPrice:    it.Price,
				Quantity:     it.Quantity,
			})
		}
	}
	return rows, nil
}

func TestOrderService(t *testing.T) {
	repo := newMockOrderRepo()
	svc := service.NewOrderService(repo)
	ctx := context.Background()

	uid := int64(42)
	prodID := int64(101)

	t.Run("CreateOrder_Success", func(t *testing.T) {
		input := dto.CreateOrderDTO{
			FirstName:       "John",
			LastName:        "Doe",
			Email:           "john@example.com",
			ShippingAddress: "123 Main St",
			Items: []dto.CreateOrderItemDTO{
				{
					ProductID:    &prodID,
					ProductTitle: "Mechanical Keyboard",
					Price:        100.0,
					Quantity:     2,
				},
			},
		}

		view, err := svc.CreateOrder(ctx, &uid, input)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if view.TotalAmount != 200.0 {
			t.Errorf("expected total 200.0, got %f", view.TotalAmount)
		}
		if len(view.OrderItems) != 1 {
			t.Fatalf("expected 1 item, got %d", len(view.OrderItems))
		}
		if view.CustomerName != "John Doe" {
			t.Errorf("expected 'John Doe', got %q", view.CustomerName)
		}
	})

	t.Run("ListUserOrders", func(t *testing.T) {
		orders, err := svc.ListUserOrders(ctx, uid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(orders) != 1 {
			t.Errorf("expected 1 order, got %d", len(orders))
		}
	})

	t.Run("ExportOrdersCSV_InMemoryStream", func(t *testing.T) {
		csvBytes, err := svc.ExportOrdersCSV(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(csvBytes) == 0 {
			t.Error("expected non-empty CSV bytes")
		}
	})

	t.Run("GetSalesChart", func(t *testing.T) {
		chart, err := svc.GetSalesChart(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(chart) == 0 {
			t.Error("expected non-empty sales chart")
		}
	})
}
