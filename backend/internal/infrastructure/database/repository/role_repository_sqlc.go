package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type roleRepositorySQLC struct {
	querier sqlc.Querier
}

// NewRoleRepositorySQLC creates an implementation of domain.RoleRepository backed by SQLC.
func NewRoleRepositorySQLC(querier sqlc.Querier) repository.RoleRepository {
	return &roleRepositorySQLC{querier: querier}
}

func (r *roleRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Role, error) {
	row, err := r.querier.GetRoleByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrRoleNotFound
		}
		return nil, err
	}

	role := &entity.Role{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
		DeletedAt: pgToTime(row.DeletedAt),
	}

	// Fetch permissions
	perms, err := r.querier.GetRolePermissions(ctx, id)
	if err == nil {
		role.Permissions = make([]entity.Permission, len(perms))
		for i, p := range perms {
			role.Permissions[i] = entity.Permission{
				ID:        p.ID,
				Name:      p.Name,
				CreatedAt: p.CreatedAt.Time,
				UpdatedAt: p.UpdatedAt.Time,
				DeletedAt: pgToTime(p.DeletedAt),
			}
		}
	}

	return role, nil
}

func (r *roleRepositorySQLC) GetByName(ctx context.Context, name string) (*entity.Role, error) {
	row, err := r.querier.GetRoleByName(ctx, name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrRoleNotFound
		}
		return nil, err
	}

	role := &entity.Role{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
		DeletedAt: pgToTime(row.DeletedAt),
	}

	perms, err := r.querier.GetRolePermissions(ctx, role.ID)
	if err == nil {
		role.Permissions = make([]entity.Permission, len(perms))
		for i, p := range perms {
			role.Permissions[i] = entity.Permission{
				ID:        p.ID,
				Name:      p.Name,
				CreatedAt: p.CreatedAt.Time,
				UpdatedAt: p.UpdatedAt.Time,
				DeletedAt: pgToTime(p.DeletedAt),
			}
		}
	}

	return role, nil
}

func (r *roleRepositorySQLC) List(ctx context.Context) ([]*entity.Role, error) {
	rows, err := r.querier.ListRoles(ctx)
	if err != nil {
		return nil, err
	}

	roles := make([]*entity.Role, len(rows))
	for i, row := range rows {
		role := &entity.Role{
			ID:        row.ID,
			Name:      row.Name,
			CreatedAt: row.CreatedAt.Time,
			UpdatedAt: row.UpdatedAt.Time,
			DeletedAt: pgToTime(row.DeletedAt),
		}

		perms, err := r.querier.GetRolePermissions(ctx, row.ID)
		if err == nil {
			role.Permissions = make([]entity.Permission, len(perms))
			for j, p := range perms {
				role.Permissions[j] = entity.Permission{
					ID:        p.ID,
					Name:      p.Name,
					CreatedAt: p.CreatedAt.Time,
					UpdatedAt: p.UpdatedAt.Time,
					DeletedAt: pgToTime(p.DeletedAt),
				}
			}
		}
		roles[i] = role
	}

	return roles, nil
}

func (r *roleRepositorySQLC) Create(ctx context.Context, name string, permissionIDs []int64) (*entity.Role, error) {
	row, err := r.querier.CreateRole(ctx, name)
	if err != nil {
		return nil, err
	}

	role := &entity.Role{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
		DeletedAt: pgToTime(row.DeletedAt),
	}

	for _, pid := range permissionIDs {
		_ = r.querier.AssignRolePermission(ctx, sqlc.AssignRolePermissionParams{
			RoleID:       role.ID,
			PermissionID: pid,
		})
	}

	perms, err := r.querier.GetRolePermissions(ctx, role.ID)
	if err == nil {
		role.Permissions = make([]entity.Permission, len(perms))
		for i, p := range perms {
			role.Permissions[i] = entity.Permission{
				ID:        p.ID,
				Name:      p.Name,
				CreatedAt: p.CreatedAt.Time,
				UpdatedAt: p.UpdatedAt.Time,
				DeletedAt: pgToTime(p.DeletedAt),
			}
		}
	}

	return role, nil
}

func (r *roleRepositorySQLC) Update(ctx context.Context, id int64, name string, permissionIDs []int64) (*entity.Role, error) {
	row, err := r.querier.UpdateRole(ctx, sqlc.UpdateRoleParams{
		ID:   id,
		Name: name,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrRoleNotFound
		}
		return nil, err
	}

	role := &entity.Role{
		ID:        row.ID,
		Name:      row.Name,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
		DeletedAt: pgToTime(row.DeletedAt),
	}

	if permissionIDs != nil {
		_ = r.querier.ClearRolePermissions(ctx, id)
		for _, pid := range permissionIDs {
			_ = r.querier.AssignRolePermission(ctx, sqlc.AssignRolePermissionParams{
				RoleID:       id,
				PermissionID: pid,
			})
		}
	}

	perms, err := r.querier.GetRolePermissions(ctx, id)
	if err == nil {
		role.Permissions = make([]entity.Permission, len(perms))
		for i, p := range perms {
			role.Permissions[i] = entity.Permission{
				ID:        p.ID,
				Name:      p.Name,
				CreatedAt: p.CreatedAt.Time,
				UpdatedAt: p.UpdatedAt.Time,
				DeletedAt: pgToTime(p.DeletedAt),
			}
		}
	}

	return role, nil
}

func (r *roleRepositorySQLC) Delete(ctx context.Context, id int64) error {
	return r.querier.DeleteRole(ctx, id)
}

func (r *roleRepositorySQLC) ListPermissions(ctx context.Context) ([]*entity.Permission, error) {
	rows, err := r.querier.ListPermissions(ctx)
	if err != nil {
		return nil, err
	}

	perms := make([]*entity.Permission, len(rows))
	for i, p := range rows {
		perms[i] = &entity.Permission{
			ID:        p.ID,
			Name:      p.Name,
			CreatedAt: p.CreatedAt.Time,
			UpdatedAt: p.UpdatedAt.Time,
			DeletedAt: pgToTime(p.DeletedAt),
		}
	}
	return perms, nil
}
