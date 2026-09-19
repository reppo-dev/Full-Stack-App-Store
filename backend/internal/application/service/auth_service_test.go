package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"golang.org/x/crypto/bcrypt"
)

// In-memory mock UserRepository for service testing
type mockUserRepo struct {
	users       map[int64]*entity.User
	byEmail     map[string]*entity.User
	byUsername  map[string]*entity.User
	nextID      int64
	shouldError bool
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{
		users:      make(map[int64]*entity.User),
		byEmail:    make(map[string]*entity.User),
		byUsername: make(map[string]*entity.User),
		nextID:     1,
	}
}

func (m *mockUserRepo) GetByID(ctx context.Context, id int64) (*entity.User, error) {
	if m.shouldError {
		return nil, domain.ErrUserNotFound
	}
	u, ok := m.users[id]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	return u, nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	if m.shouldError {
		return nil, domain.ErrUserNotFound
	}
	u, ok := m.byEmail[email]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	return u, nil
}

func (m *mockUserRepo) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	if m.shouldError {
		return nil, domain.ErrUserNotFound
	}
	u, ok := m.byUsername[username]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	return u, nil
}

func (m *mockUserRepo) List(ctx context.Context, limit, offset int32) ([]*entity.User, error) {
	var list []*entity.User
	for _, u := range m.users {
		list = append(list, u)
	}
	return list, nil
}

func (m *mockUserRepo) ListAll(ctx context.Context) ([]*entity.User, error) {
	var list []*entity.User
	for _, u := range m.users {
		list = append(list, u)
	}
	return list, nil
}

func (m *mockUserRepo) Count(ctx context.Context) (int64, error) {
	return int64(len(m.users)), nil
}

func (m *mockUserRepo) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	user.ID = m.nextID
	m.nextID++
	m.users[user.ID] = user
	m.byEmail[user.Email] = user
	m.byUsername[user.UserName] = user
	return user, nil
}

func (m *mockUserRepo) Update(ctx context.Context, user *entity.User) (*entity.User, error) {
	m.users[user.ID] = user
	m.byEmail[user.Email] = user
	m.byUsername[user.UserName] = user
	return user, nil
}

func (m *mockUserRepo) UpdateProfile(ctx context.Context, user *entity.User) (*entity.User, error) {
	existing, ok := m.users[user.ID]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	existing.FirstName = user.FirstName
	existing.LastName = user.LastName
	existing.Image = user.Image
	existing.PhoneNumber = user.PhoneNumber
	existing.Email = user.Email
	return existing, nil
}

func (m *mockUserRepo) UpdatePassword(ctx context.Context, id int64, hashedPassword string) error {
	existing, ok := m.users[id]
	if !ok {
		return domain.ErrUserNotFound
	}
	existing.Password = hashedPassword
	return nil
}

func (m *mockUserRepo) Delete(ctx context.Context, id int64) error {
	delete(m.users, id)
	return nil
}

func TestAuthService(t *testing.T) {
	repo := newMockUserRepo()
	hasher := security.NewBcryptHasher(bcrypt.MinCost)
	tm := security.NewJWTTokenManager("super-secret-test-token-key-32-chars-long", time.Hour)
	svc := service.NewAuthService(repo, hasher, tm)

	ctx := context.Background()

	t.Run("Register_Success", func(t *testing.T) {
		resp, err := svc.Register(ctx, dto.RegisterRequestDTO{
			FirstName:       "John",
			LastName:        "Doe",
			UserName:        "johndoe",
			Email:           "john@example.com",
			Password:        "Password123!",
			PasswordConfirm: "Password123!",
		})
		if err != nil {
			t.Fatalf("unexpected error registering: %v", err)
		}
		if resp.Token == "" {
			t.Error("expected non-empty token")
		}
		if resp.User.Email != "john@example.com" {
			t.Errorf("expected email john@example.com, got %s", resp.User.Email)
		}
	})

	t.Run("Register_PasswordMismatch", func(t *testing.T) {
		_, err := svc.Register(ctx, dto.RegisterRequestDTO{
			UserName:        "janedoe",
			Email:           "jane@example.com",
			Password:        "Password123!",
			PasswordConfirm: "MismatchPassword!",
		})
		if err != domain.ErrPasswordMismatch {
			t.Fatalf("expected ErrPasswordMismatch, got %v", err)
		}
	})

	t.Run("Register_DuplicateEmail", func(t *testing.T) {
		_, err := svc.Register(ctx, dto.RegisterRequestDTO{
			UserName:        "johnother",
			Email:           "john@example.com",
			Password:        "Password123!",
			PasswordConfirm: "Password123!",
		})
		if err != domain.ErrEmailAlreadyExists {
			t.Fatalf("expected ErrEmailAlreadyExists, got %v", err)
		}
	})

	t.Run("Login_Success", func(t *testing.T) {
		resp, err := svc.Login(ctx, dto.LoginRequestDTO{
			Email:    "john@example.com",
			Password: "Password123!",
		})
		if err != nil {
			t.Fatalf("unexpected error logging in: %v", err)
		}
		if resp.Token == "" {
			t.Error("expected token on login")
		}
	})

	t.Run("Login_InvalidPassword", func(t *testing.T) {
		_, err := svc.Login(ctx, dto.LoginRequestDTO{
			Email:    "john@example.com",
			Password: "WrongPassword!",
		})
		if err != domain.ErrInvalidCredentials {
			t.Fatalf("expected ErrInvalidCredentials, got %v", err)
		}
	})

	t.Run("Login_NonExistentUser", func(t *testing.T) {
		_, err := svc.Login(ctx, dto.LoginRequestDTO{
			Email:    "nonexistent@example.com",
			Password: "Password123!",
		})
		if err != domain.ErrInvalidCredentials {
			t.Fatalf("expected ErrInvalidCredentials, got %v", err)
		}
	})
}
