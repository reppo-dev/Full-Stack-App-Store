package service_test

import (
	"context"
	"testing"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type mockProductRepo struct {
	products map[int64]*entity.Product
	nextID   int64
}

func newMockProductRepo() *mockProductRepo {
	return &mockProductRepo{
		products: make(map[int64]*entity.Product),
		nextID:   1,
	}
}

func (m *mockProductRepo) GetByID(ctx context.Context, id int64) (*entity.Product, error) {
	if p, ok := m.products[id]; ok {
		return p, nil
	}
	return nil, domain.ErrProductNotFound
}

func (m *mockProductRepo) GetBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	for _, p := range m.products {
		if p.Slug == slug {
			return p, nil
		}
	}
	return nil, domain.ErrProductNotFound
}

func (m *mockProductRepo) List(ctx context.Context, params repository.ProductListParams) ([]*entity.Product, error) {
	var list []*entity.Product
	for _, p := range m.products {
		if params.CategoryID != nil && (p.CategoryID == nil || *p.CategoryID != *params.CategoryID) {
			continue
		}
		list = append(list, p)
	}
	return list, nil
}

func (m *mockProductRepo) ListAll(ctx context.Context) ([]*entity.Product, error) {
	var list []*entity.Product
	for _, p := range m.products {
		list = append(list, p)
	}
	return list, nil
}

func (m *mockProductRepo) Count(ctx context.Context, params repository.ProductListParams) (int64, error) {
	return int64(len(m.products)), nil
}

func (m *mockProductRepo) Create(ctx context.Context, p *entity.Product) (*entity.Product, error) {
	p.ID = m.nextID
	m.nextID++
	m.products[p.ID] = p
	return p, nil
}

func (m *mockProductRepo) Update(ctx context.Context, p *entity.Product) (*entity.Product, error) {
	m.products[p.ID] = p
	return p, nil
}

func (m *mockProductRepo) UpdateStock(ctx context.Context, id int64, newStock int32) error {
	if p, ok := m.products[id]; ok {
		p.Stock = newStock
		return nil
	}
	return domain.ErrProductNotFound
}

func (m *mockProductRepo) Delete(ctx context.Context, id int64) error {
	delete(m.products, id)
	return nil
}

func TestProductService(t *testing.T) {
	repo := newMockProductRepo()
	svc := service.NewProductService(repo)
	ctx := context.Background()

	t.Run("Create_Success", func(t *testing.T) {
		catID := int64(10)
		prod, err := svc.Create(ctx, dto.CreateProductDTO{
			Title:       "Gaming Laptop",
			Slug:        "gaming-laptop",
			Description: "High-end gaming laptop",
			Price:       1299.99,
			Stock:       15,
			CategoryID:  &catID,
		})
		if err != nil {
			t.Fatalf("unexpected error creating product: %v", err)
		}
		if prod.ID != 1 {
			t.Errorf("expected ID 1, got %d", prod.ID)
		}
		if prod.Title != "Gaming Laptop" {
			t.Errorf("expected Gaming Laptop, got %s", prod.Title)
		}
	})

	t.Run("GetByID_Success", func(t *testing.T) {
		prod, err := svc.GetByID(ctx, 1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if prod.Price != 1299.99 {
			t.Errorf("expected price 1299.99, got %f", prod.Price)
		}
	})

	t.Run("GetBySlug_Success", func(t *testing.T) {
		prod, err := svc.GetBySlug(ctx, "gaming-laptop")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if prod.Slug != "gaming-laptop" {
			t.Errorf("expected slug gaming-laptop, got %s", prod.Slug)
		}
	})

	t.Run("List_Pagination", func(t *testing.T) {
		result, err := svc.List(ctx, 1, 10, nil, nil)
		if err != nil {
			t.Fatalf("unexpected error listing products: %v", err)
		}
		if result.Total != 1 {
			t.Errorf("expected total 1, got %d", result.Total)
		}
	})
}
