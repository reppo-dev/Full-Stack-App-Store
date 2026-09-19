package service_test

import (
	"context"
	"testing"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
)

type mockRoleRepo struct {
	roles       map[int64]*entity.Role
	permissions map[int64]*entity.Permission
	nextRoleID  int64
}

func newMockRoleRepo() *mockRoleRepo {
	m := &mockRoleRepo{
		roles:       make(map[int64]*entity.Role),
		permissions: make(map[int64]*entity.Permission),
		nextRoleID:  1,
	}
	m.permissions[1] = &entity.Permission{ID: 1, Name: "users.read"}
	m.permissions[2] = &entity.Permission{ID: 2, Name: "users.write"}
	return m
}

func (m *mockRoleRepo) GetByID(ctx context.Context, id int64) (*entity.Role, error) {
	r, ok := m.roles[id]
	if !ok {
		return nil, domain.ErrRoleNotFound
	}
	return r, nil
}

func (m *mockRoleRepo) GetByName(ctx context.Context, name string) (*entity.Role, error) {
	for _, r := range m.roles {
		if r.Name == name {
			return r, nil
		}
	}
	return nil, domain.ErrRoleNotFound
}

func (m *mockRoleRepo) List(ctx context.Context) ([]*entity.Role, error) {
	var list []*entity.Role
	for _, r := range m.roles {
		list = append(list, r)
	}
	return list, nil
}

func (m *mockRoleRepo) Create(ctx context.Context, name string, permissionIDs []int64) (*entity.Role, error) {
	r := &entity.Role{
		ID:   m.nextRoleID,
		Name: name,
	}
	m.nextRoleID++
	for _, pid := range permissionIDs {
		if p, ok := m.permissions[pid]; ok {
			r.Permissions = append(r.Permissions, *p)
		}
	}
	m.roles[r.ID] = r
	return r, nil
}

func (m *mockRoleRepo) Update(ctx context.Context, id int64, name string, permissionIDs []int64) (*entity.Role, error) {
	r, ok := m.roles[id]
	if !ok {
		return nil, domain.ErrRoleNotFound
	}
	r.Name = name
	r.Permissions = nil
	for _, pid := range permissionIDs {
		if p, ok := m.permissions[pid]; ok {
			r.Permissions = append(r.Permissions, *p)
		}
	}
	return r, nil
}

func (m *mockRoleRepo) Delete(ctx context.Context, id int64) error {
	delete(m.roles, id)
	return nil
}

func (m *mockRoleRepo) ListPermissions(ctx context.Context) ([]*entity.Permission, error) {
	var list []*entity.Permission
	for _, p := range m.permissions {
		list = append(list, p)
	}
	return list, nil
}

func TestRoleService(t *testing.T) {
	repo := newMockRoleRepo()
	svc := service.NewRoleService(repo)
	ctx := context.Background()

	t.Run("CreateRole_Success", func(t *testing.T) {
		role, err := svc.Create(ctx, dto.CreateRoleDTO{
			Name:        "moderator",
			Permissions: []int64{1},
		})
		if err != nil {
			t.Fatalf("unexpected error creating role: %v", err)
		}
		if role.Name != "moderator" {
			t.Errorf("expected role name moderator, got %s", role.Name)
		}
		if len(role.Permissions) != 1 {
			t.Errorf("expected 1 permission, got %d", len(role.Permissions))
		}
	})

	t.Run("GetByID_Success", func(t *testing.T) {
		role, err := svc.GetByID(ctx, 1)
		if err != nil {
			t.Fatalf("unexpected error getting role: %v", err)
		}
		if role.ID != 1 {
			t.Errorf("expected role ID 1, got %d", role.ID)
		}
	})

	t.Run("List_Success", func(t *testing.T) {
		roles, err := svc.List(ctx)
		if err != nil {
			t.Fatalf("unexpected error listing roles: %v", err)
		}
		if len(roles) != 1 {
			t.Errorf("expected 1 role, got %d", len(roles))
		}
	})
}
