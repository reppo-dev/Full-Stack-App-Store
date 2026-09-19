package service_test

import (
	"context"
	"testing"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
)

type mockCategoryRepo struct {
	categories map[int64]*entity.Category
	nextID     int64
}

func newMockCategoryRepo() *mockCategoryRepo {
	return &mockCategoryRepo{
		categories: make(map[int64]*entity.Category),
		nextID:     1,
	}
}

func (m *mockCategoryRepo) GetByID(ctx context.Context, id int64) (*entity.Category, error) {
	if c, ok := m.categories[id]; ok {
		return c, nil
	}
	return nil, domain.ErrCategoryNotFound
}

func (m *mockCategoryRepo) GetBySlug(ctx context.Context, slug string) (*entity.Category, error) {
	for _, c := range m.categories {
		if c.Slug == slug {
			return c, nil
		}
	}
	return nil, domain.ErrCategoryNotFound
}

func (m *mockCategoryRepo) List(ctx context.Context) ([]*entity.Category, error) {
	var list []*entity.Category
	for _, c := range m.categories {
		list = append(list, c)
	}
	return list, nil
}

func (m *mockCategoryRepo) GetTree(ctx context.Context) ([]*entity.Category, error) {
	var roots []*entity.Category
	for _, c := range m.categories {
		if c.ParentID == nil || *c.ParentID == 0 {
			roots = append(roots, c)
		}
	}
	return roots, nil
}

func (m *mockCategoryRepo) Create(ctx context.Context, cat *entity.Category) (*entity.Category, error) {
	cat.ID = m.nextID
	m.nextID++
	m.categories[cat.ID] = cat
	return cat, nil
}

func (m *mockCategoryRepo) Update(ctx context.Context, cat *entity.Category) (*entity.Category, error) {
	existing, ok := m.categories[cat.ID]
	if !ok {
		return nil, domain.ErrCategoryNotFound
	}
	existing.Name = cat.Name
	existing.Slug = cat.Slug
	existing.ParentID = cat.ParentID
	return existing, nil
}

func (m *mockCategoryRepo) Delete(ctx context.Context, id int64) error {
	delete(m.categories, id)
	return nil
}

func TestCategoryService(t *testing.T) {
	repo := newMockCategoryRepo()
	svc := service.NewCategoryService(repo)
	ctx := context.Background()

	t.Run("Create_Success", func(t *testing.T) {
		cat, err := svc.Create(ctx, dto.CreateCategoryDTO{
			Name: "Electronics",
			Slug: "electronics",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if cat.Name != "Electronics" {
			t.Errorf("expected Electronics, got %s", cat.Name)
		}
	})

	t.Run("GetByID_Success", func(t *testing.T) {
		cat, err := svc.GetByID(ctx, 1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if cat.ID != 1 {
			t.Errorf("expected ID 1, got %d", cat.ID)
		}
	})

	t.Run("GetBySlug_Success", func(t *testing.T) {
		cat, err := svc.GetBySlug(ctx, "electronics")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if cat.Slug != "electronics" {
			t.Errorf("expected electronics slug, got %s", cat.Slug)
		}
	})

	t.Run("GetTree_Success", func(t *testing.T) {
		tree, err := svc.GetTree(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(tree) != 1 {
			t.Errorf("expected 1 root category, got %d", len(tree))
		}
	})
}
