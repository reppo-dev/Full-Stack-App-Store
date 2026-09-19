package repository

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	domainRepo "github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

// OrderRepositorySQLC implements repository.OrderRepository using SQLC and pgxpool.
type OrderRepositorySQLC struct {
	querier *sqlc.Queries
	pool    *pgxpool.Pool
}

// NewOrderRepositorySQLC constructs a new OrderRepositorySQLC instance.
func NewOrderRepositorySQLC(querier *sqlc.Queries, pool *pgxpool.Pool) *OrderRepositorySQLC {
	return &OrderRepositorySQLC{
		querier: querier,
		pool:    pool,
	}
}

// CreateOrderAtomic executes an atomic checkout transaction:
// 1. Locks product inventory rows with SELECT FOR UPDATE
// 2. Verifies stock availability
// 3. Decrements inventory
// 4. Inserts order header and line items
func (r *OrderRepositorySQLC) CreateOrderAtomic(ctx context.Context, params domainRepo.CreateOrderParams) (*entity.Order, error) {
	if len(params.Items) == 0 {
		return nil, domain.ErrEmptyOrderItems
	}

	if r.pool == nil {
		return nil, errors.New("database pool not initialized")
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := r.querier.WithTx(tx)

	// Step 1 & 2: Row-level lock and stock verification
	for _, item := range params.Items {
		if item.ProductID != nil && *item.ProductID > 0 {
			prod, err := qtx.LockProductForUpdate(ctx, *item.ProductID)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					return nil, domain.ErrProductNotFound
				}
				return nil, fmt.Errorf("failed to lock product %d: %w", *item.ProductID, err)
			}

			if prod.IsActive.Valid && !prod.IsActive.Bool {
				return nil, fmt.Errorf("product %q is inactive", prod.Title)
			}

			availableStock := int64(prod.Stock.Int32)
			if availableStock < item.Quantity {
				return nil, fmt.Errorf("%w for product %q (requested %d, available %d)",
					domain.ErrInsufficientStock, prod.Title, item.Quantity, availableStock)
			}

			// Step 3: Decrement stock
			if err := qtx.DecrementProductStock(ctx, sqlc.DecrementProductStockParams{
				ID:    *item.ProductID,
				Stock: pgtype.Int4{Int32: int32(item.Quantity), Valid: true},
			}); err != nil {
				return nil, fmt.Errorf("failed to decrement stock: %w", err)
			}
		}
	}

	// Step 4: Create Order Record
	status := string(params.Status)
	if status == "" {
		status = string(entity.OrderStatusPending)
	}

	var userID pgtype.Int8
	if params.UserID != nil && *params.UserID > 0 {
		userID = pgtype.Int8{Int64: *params.UserID, Valid: true}
	}

	createdOrder, err := qtx.CreateOrder(ctx, sqlc.CreateOrderParams{
		UserID:          userID,
		FirstName:       pgtype.Text{String: params.FirstName, Valid: params.FirstName != ""},
		LastName:        pgtype.Text{String: params.LastName, Valid: params.LastName != ""},
		Email:           pgtype.Text{String: params.Email, Valid: params.Email != ""},
		TotalAmount:     floatToNumericVal(params.TotalAmount),
		ShippingAddress: pgtype.Text{String: params.ShippingAddress, Valid: params.ShippingAddress != ""},
		Status:          status,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to insert order: %w", err)
	}

	// Step 5: Create Order Items
	orderItems := make([]entity.OrderItem, len(params.Items))
	for i, item := range params.Items {
		var itemProductID pgtype.Int8
		if item.ProductID != nil && *item.ProductID > 0 {
			itemProductID = pgtype.Int8{Int64: *item.ProductID, Valid: true}
		}

		createdItem, err := qtx.CreateOrderItem(ctx, sqlc.CreateOrderItemParams{
			OrderID:      createdOrder.ID,
			ProductID:    itemProductID,
			ProductTitle: pgtype.Text{String: item.ProductTitle, Valid: item.ProductTitle != ""},
			Price:        float32(item.Price),
			Quantity:     item.Quantity,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to insert order item: %w", err)
		}

		var prodIDPtr *int64
		if createdItem.ProductID.Valid {
			prodIDPtr = &createdItem.ProductID.Int64
		}

		orderItems[i] = entity.OrderItem{
			ID:           createdItem.ID,
			OrderID:      createdItem.OrderID,
			ProductID:    prodIDPtr,
			ProductTitle: createdItem.ProductTitle.String,
			Price:        float64(createdItem.Price),
			Quantity:     createdItem.Quantity,
			CreatedAt:    createdItem.CreatedAt.Time,
			UpdatedAt:    createdItem.UpdatedAt.Time,
		}
	}

	// Commit Transaction
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit order transaction: %w", err)
	}

	var finalUserID *int64
	if createdOrder.UserID.Valid {
		finalUserID = &createdOrder.UserID.Int64
	}

	return &entity.Order{
		ID:              createdOrder.ID,
		UserID:          finalUserID,
		FirstName:       createdOrder.FirstName.String,
		LastName:        createdOrder.LastName.String,
		Email:           createdOrder.Email.String,
		TotalAmount:     numericToFloatVal(createdOrder.TotalAmount),
		ShippingAddress: createdOrder.ShippingAddress.String,
		Status:          entity.OrderStatus(createdOrder.Status),
		OrderItems:      orderItems,
		CreatedAt:       createdOrder.CreatedAt.Time,
		UpdatedAt:       createdOrder.UpdatedAt.Time,
	}, nil
}

// GetByID retrieves a single order and its items by numeric ID.
func (r *OrderRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Order, error) {
	row, err := r.querier.GetOrderByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrOrderNotFound
		}
		return nil, err
	}

	items, err := r.querier.GetOrderItemsByOrderID(ctx, id)
	if err != nil {
		return nil, err
	}

	orderItems := make([]entity.OrderItem, len(items))
	for i, it := range items {
		var prodID *int64
		if it.ProductID.Valid {
			prodID = &it.ProductID.Int64
		}
		orderItems[i] = entity.OrderItem{
			ID:           it.ID,
			OrderID:      it.OrderID,
			ProductID:    prodID,
			ProductTitle: it.ProductTitle.String,
			Price:        float64(it.Price),
			Quantity:     it.Quantity,
			CreatedAt:    it.CreatedAt.Time,
			UpdatedAt:    it.UpdatedAt.Time,
		}
	}

	var userID *int64
	if row.UserID.Valid {
		userID = &row.UserID.Int64
	}

	return &entity.Order{
		ID:              row.ID,
		UserID:          userID,
		FirstName:       row.FirstName.String,
		LastName:        row.LastName.String,
		Email:           row.Email.String,
		TotalAmount:     numericToFloatVal(row.TotalAmount),
		ShippingAddress: row.ShippingAddress.String,
		Status:          entity.OrderStatus(row.Status),
		OrderItems:      orderItems,
		CreatedAt:       row.CreatedAt.Time,
		UpdatedAt:       row.UpdatedAt.Time,
	}, nil
}

// ListByUserID retrieves all orders belonging to a specific customer with their items.
func (r *OrderRepositorySQLC) ListByUserID(ctx context.Context, userID int64) ([]*entity.Order, error) {
	rows, err := r.querier.ListOrdersByUserID(ctx, pgtype.Int8{Int64: userID, Valid: true})
	if err != nil {
		return nil, err
	}

	orders := make([]*entity.Order, len(rows))
	for i, row := range rows {
		items, err := r.querier.GetOrderItemsByOrderID(ctx, row.ID)
		if err != nil {
			return nil, err
		}

		orderItems := make([]entity.OrderItem, len(items))
		for j, it := range items {
			var prodID *int64
			if it.ProductID.Valid {
				prodID = &it.ProductID.Int64
			}
			orderItems[j] = entity.OrderItem{
				ID:           it.ID,
				OrderID:      it.OrderID,
				ProductID:    prodID,
				ProductTitle: it.ProductTitle.String,
				Price:        float64(it.Price),
				Quantity:     it.Quantity,
				CreatedAt:    it.CreatedAt.Time,
				UpdatedAt:    it.UpdatedAt.Time,
			}
		}

		var uid *int64
		if row.UserID.Valid {
			uid = &row.UserID.Int64
		}

		orders[i] = &entity.Order{
			ID:              row.ID,
			UserID:          uid,
			FirstName:       row.FirstName.String,
			LastName:        row.LastName.String,
			Email:           row.Email.String,
			TotalAmount:     numericToFloatVal(row.TotalAmount),
			ShippingAddress: row.ShippingAddress.String,
			Status:          entity.OrderStatus(row.Status),
			OrderItems:      orderItems,
			CreatedAt:       row.CreatedAt.Time,
			UpdatedAt:       row.UpdatedAt.Time,
		}
	}

	return orders, nil
}

// ListAll retrieves a paginated list of all orders (admin usage).
func (r *OrderRepositorySQLC) ListAll(ctx context.Context, params domainRepo.OrderListParams) ([]*entity.Order, error) {
	rows, err := r.querier.ListAllOrders(ctx, sqlc.ListAllOrdersParams{
		Limit:  params.Limit,
		Offset: params.Offset,
	})
	if err != nil {
		return nil, err
	}

	orders := make([]*entity.Order, len(rows))
	for i, row := range rows {
		items, err := r.querier.GetOrderItemsByOrderID(ctx, row.ID)
		if err != nil {
			return nil, err
		}

		orderItems := make([]entity.OrderItem, len(items))
		for j, it := range items {
			var prodID *int64
			if it.ProductID.Valid {
				prodID = &it.ProductID.Int64
			}
			orderItems[j] = entity.OrderItem{
				ID:           it.ID,
				OrderID:      it.OrderID,
				ProductID:    prodID,
				ProductTitle: it.ProductTitle.String,
				Price:        float64(it.Price),
				Quantity:     it.Quantity,
				CreatedAt:    it.CreatedAt.Time,
				UpdatedAt:    it.UpdatedAt.Time,
			}
		}

		var uid *int64
		if row.UserID.Valid {
			uid = &row.UserID.Int64
		}

		orders[i] = &entity.Order{
			ID:              row.ID,
			UserID:          uid,
			FirstName:       row.FirstName.String,
			LastName:        row.LastName.String,
			Email:           row.Email.String,
			TotalAmount:     numericToFloatVal(row.TotalAmount),
			ShippingAddress: row.ShippingAddress.String,
			Status:          entity.OrderStatus(row.Status),
			OrderItems:      orderItems,
			CreatedAt:       row.CreatedAt.Time,
			UpdatedAt:       row.UpdatedAt.Time,
		}
	}

	return orders, nil
}

// Count returns the total number of orders in the database.
func (r *OrderRepositorySQLC) Count(ctx context.Context) (int64, error) {
	return r.querier.CountOrders(ctx)
}

// UpdateStatus updates the order fulfillment lifecycle state.
func (r *OrderRepositorySQLC) UpdateStatus(ctx context.Context, id int64, status entity.OrderStatus) (*entity.Order, error) {
	row, err := r.querier.UpdateOrderStatus(ctx, sqlc.UpdateOrderStatusParams{
		ID:     id,
		Status: string(status),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrOrderNotFound
		}
		return nil, err
	}

	var uid *int64
	if row.UserID.Valid {
		uid = &row.UserID.Int64
	}

	return &entity.Order{
		ID:              row.ID,
		UserID:          uid,
		FirstName:       row.FirstName.String,
		LastName:        row.LastName.String,
		Email:           row.Email.String,
		TotalAmount:     numericToFloatVal(row.TotalAmount),
		ShippingAddress: row.ShippingAddress.String,
		Status:          entity.OrderStatus(row.Status),
		CreatedAt:       row.CreatedAt.Time,
		UpdatedAt:       row.UpdatedAt.Time,
	}, nil
}

// GetDailySales retrieves aggregated sales figures for analytics.
func (r *OrderRepositorySQLC) GetDailySales(ctx context.Context) ([]entity.DailySalesMetric, error) {
	rows, err := r.querier.DailySalesChart(ctx)
	if err != nil {
		return nil, err
	}

	metrics := make([]entity.DailySalesMetric, len(rows))
	for i, row := range rows {
		total, _ := row.TotalSales.Float64Value()
		metrics[i] = entity.DailySalesMetric{
			SaleDate:   row.SaleDate,
			TotalSales: total.Float64,
			OrderCount: row.OrderCount,
		}
	}

	return metrics, nil
}

// GetAllForExport retrieves flattened order items for in-memory CSV generation.
func (r *OrderRepositorySQLC) GetAllForExport(ctx context.Context) ([]entity.OrderExportRow, error) {
	rows, err := r.querier.GetAllOrdersWithItemsForExport(ctx)
	if err != nil {
		return nil, err
	}

	exportRows := make([]entity.OrderExportRow, len(rows))
	for i, row := range rows {
		var price float64
		if row.ItemPrice.Valid {
			price = float64(row.ItemPrice.Float32)
		}

		var qty int64
		if row.ItemQuantity.Valid {
			qty = row.ItemQuantity.Int64
		}

		exportRows[i] = entity.OrderExportRow{
			OrderID:      row.OrderID,
			CustomerName: row.FirstName.String + " " + row.LastName.String,
			Email:        row.Email.String,
			TotalAmount:  numericToFloatVal(row.TotalAmount),
			Status:       row.Status,
			CreatedAt:    row.CreatedAt.Time,
			ProductTitle: row.ProductTitle.String,
			ItemPrice:    price,
			Quantity:     qty,
		}
	}

	return exportRows, nil
}

func floatToNumericVal(f float64) pgtype.Numeric {
	var num pgtype.Numeric
	_ = num.Scan(strconv.FormatFloat(f, 'f', 2, 64))
	return num
}
