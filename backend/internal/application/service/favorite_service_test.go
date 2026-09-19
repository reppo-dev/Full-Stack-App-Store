package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain/entity"
)

type mockFavoriteRepo struct {
	favorites map[int64]*entity.Favorite
	nextID    int64
}

func newMockFavoriteRepo() *mockFavoriteRepo {
	return &mockFavoriteRepo{
		favorites: make(map[int64]*entity.Favorite),
		nextID:    1,
	}
}

func (m *mockFavoriteRepo) ListByUserID(ctx context.Context, userID int64) ([]*entity.Favorite, error) {
	var list []*entity.Favorite
	for _, f := range m.favorites {
		if f.UserID == userID {
			list = append(list, f)
		}
	}
	return list, nil
}

func (m *mockFavoriteRepo) IsFavorite(ctx context.Context, userID, productID int64) (bool, error) {
	for _, f := range m.favorites {
		if f.UserID == userID && f.ProductID == productID {
			return true, nil
		}
	}
	return false, nil
}

func (m *mockFavoriteRepo) Add(ctx context.Context, userID, productID int64) (*entity.Favorite, error) {
	for _, f := range m.favorites {
		if f.UserID == userID && f.ProductID == productID {
			return f, nil
		}
	}

	fav := &entity.Favorite{
		ID:        m.nextID,
		UserID:    userID,
		ProductID: productID,
		CreatedAt: time.Now(),
	}
	m.nextID++
	m.favorites[fav.ID] = fav
	return fav, nil
}

func (m *mockFavoriteRepo) Remove(ctx context.Context, userID, productID int64) error {
	for id, f := range m.favorites {
		if f.UserID == userID && f.ProductID == productID {
			delete(m.favorites, id)
			return nil
		}
	}
	return nil
}

func TestFavoriteService(t *testing.T) {
	repo := newMockFavoriteRepo()
	svc := service.NewFavoriteService(repo)
	ctx := context.Background()

	t.Run("Add_Success", func(t *testing.T) {
		fav, err := svc.Add(ctx, 10, 100)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if fav.UserID != 10 || fav.ProductID != 100 {
			t.Errorf("expected user 10 product 100, got user %d product %d", fav.UserID, fav.ProductID)
		}
	})

	t.Run("IsFavorite_True", func(t *testing.T) {
		isFav, err := svc.IsFavorite(ctx, 10, 100)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !isFav {
			t.Errorf("expected true, got false")
		}
	})

	t.Run("IsFavorite_False", func(t *testing.T) {
		isFav, err := svc.IsFavorite(ctx, 10, 200)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if isFav {
			t.Errorf("expected false, got true")
		}
	})

	t.Run("List_Success", func(t *testing.T) {
		list, err := svc.List(ctx, 10)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(list) != 1 {
			t.Errorf("expected 1 favorite, got %d", len(list))
		}
	})

	t.Run("Remove_Success", func(t *testing.T) {
		if err := svc.Remove(ctx, 10, 100); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		isFav, _ := svc.IsFavorite(ctx, 10, 100)
		if isFav {
			t.Errorf("expected false after remove, got true")
		}
	})
}
