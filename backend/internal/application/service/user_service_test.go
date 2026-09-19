package service_test

import (
	"context"
	"testing"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"golang.org/x/crypto/bcrypt"
)

func TestUserService(t *testing.T) {
	repo := newMockUserRepo()
	hasher := security.NewBcryptHasher(bcrypt.MinCost)
	svc := service.NewUserService(repo, hasher)
	ctx := context.Background()

	// Seed 3 users
	_, _ = repo.Create(ctx, &entity.User{UserName: "u1", Email: "u1@test.com", RoleID: 1, RoleName: "customer"})
	_, _ = repo.Create(ctx, &entity.User{UserName: "u2", Email: "u2@test.com", RoleID: 2, RoleName: "admin"})
	_, _ = repo.Create(ctx, &entity.User{UserName: "u3", Email: "u3@test.com", RoleID: 1, RoleName: "customer"})

	t.Run("GetByID_Success", func(t *testing.T) {
		u, err := svc.GetByID(ctx, 1)
		if err != nil {
			t.Fatalf("unexpected error getting user: %v", err)
		}
		if u.UserName != "u1" {
			t.Errorf("expected username u1, got %s", u.UserName)
		}
	})

	t.Run("List_Pagination", func(t *testing.T) {
		result, err := svc.List(ctx, 1, 2)
		if err != nil {
			t.Fatalf("unexpected error listing users: %v", err)
		}
		if result.Total != 3 {
			t.Errorf("expected total 3, got %d", result.Total)
		}
		if result.LastPage != 2 {
			t.Errorf("expected last page 2, got %d", result.LastPage)
		}
	})

	t.Run("Create_Success", func(t *testing.T) {
		created, err := svc.Create(ctx, dto.CreateUserDTO{
			UserName: "admin2",
			Email:    "admin2@test.com",
			Password: "AdminPassword123!",
			RoleID:   2,
		})
		if err != nil {
			t.Fatalf("unexpected error creating user: %v", err)
		}
		if created.ID == 0 {
			t.Error("expected non-zero user ID")
		}
	})

	t.Run("UpdateProfile_Success", func(t *testing.T) {
		updated, err := svc.UpdateProfile(ctx, 1, dto.UpdateProfileDTO{
			FirstName: "UpdatedFirst",
			LastName:  "UpdatedLast",
			Email:     "u1-updated@test.com",
		})
		if err != nil {
			t.Fatalf("unexpected error updating profile: %v", err)
		}
		if updated.FirstName != "UpdatedFirst" {
			t.Errorf("expected UpdatedFirst, got %s", updated.FirstName)
		}
	})
}
