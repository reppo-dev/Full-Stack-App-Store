package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type userRepositorySQLC struct {
	querier sqlc.Querier
}

// NewUserRepositorySQLC creates an implementation of domain.UserRepository backed by SQLC.
func NewUserRepositorySQLC(querier sqlc.Querier) repository.UserRepository {
	return &userRepositorySQLC{querier: querier}
}

func (r *userRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.User, error) {
	row, err := r.querier.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return &entity.User{
		ID:          row.ID,
		FirstName:   pgToText(row.FirstName),
		LastName:    pgToText(row.LastName),
		Image:       pgToText(row.Image),
		UserName:    row.UserName,
		PhoneNumber: pgToText(row.PhoneNumber),
		DateOfBirth: pgToTime(row.DateOfBirth),
		Email:       row.Email,
		Password:    row.Password,
		RoleID:      pgToInt8(row.RoleID),
		RoleName:    row.RoleName,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
		DeletedAt:   pgToTime(row.DeletedAt),
	}, nil
}

func (r *userRepositorySQLC) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	row, err := r.querier.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return &entity.User{
		ID:          row.ID,
		FirstName:   pgToText(row.FirstName),
		LastName:    pgToText(row.LastName),
		Image:       pgToText(row.Image),
		UserName:    row.UserName,
		PhoneNumber: pgToText(row.PhoneNumber),
		DateOfBirth: pgToTime(row.DateOfBirth),
		Email:       row.Email,
		Password:    row.Password,
		RoleID:      pgToInt8(row.RoleID),
		RoleName:    row.RoleName,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
		DeletedAt:   pgToTime(row.DeletedAt),
	}, nil
}

func (r *userRepositorySQLC) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	row, err := r.querier.GetUserByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	return &entity.User{
		ID:          row.ID,
		FirstName:   pgToText(row.FirstName),
		LastName:    pgToText(row.LastName),
		Image:       pgToText(row.Image),
		UserName:    row.UserName,
		PhoneNumber: pgToText(row.PhoneNumber),
		DateOfBirth: pgToTime(row.DateOfBirth),
		Email:       row.Email,
		Password:    row.Password,
		RoleID:      pgToInt8(row.RoleID),
		RoleName:    row.RoleName,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
		DeletedAt:   pgToTime(row.DeletedAt),
	}, nil
}

func (r *userRepositorySQLC) List(ctx context.Context, limit, offset int32) ([]*entity.User, error) {
	rows, err := r.querier.ListUsers(ctx, sqlc.ListUsersParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, err
	}

	users := make([]*entity.User, len(rows))
	for i, row := range rows {
		users[i] = &entity.User{
			ID:          row.ID,
			FirstName:   pgToText(row.FirstName),
			LastName:    pgToText(row.LastName),
			Image:       pgToText(row.Image),
			UserName:    row.UserName,
			PhoneNumber: pgToText(row.PhoneNumber),
			DateOfBirth: pgToTime(row.DateOfBirth),
			Email:       row.Email,
			RoleID:      pgToInt8(row.RoleID),
			RoleName:    row.RoleName,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
			DeletedAt:   pgToTime(row.DeletedAt),
		}
	}
	return users, nil
}

func (r *userRepositorySQLC) ListAll(ctx context.Context) ([]*entity.User, error) {
	rows, err := r.querier.ListAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	users := make([]*entity.User, len(rows))
	for i, row := range rows {
		users[i] = &entity.User{
			ID:          row.ID,
			FirstName:   pgToText(row.FirstName),
			LastName:    pgToText(row.LastName),
			Image:       pgToText(row.Image),
			UserName:    row.UserName,
			PhoneNumber: pgToText(row.PhoneNumber),
			DateOfBirth: pgToTime(row.DateOfBirth),
			Email:       row.Email,
			RoleID:      pgToInt8(row.RoleID),
			RoleName:    row.RoleName,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
			DeletedAt:   pgToTime(row.DeletedAt),
		}
	}
	return users, nil
}

func (r *userRepositorySQLC) Count(ctx context.Context) (int64, error) {
	return r.querier.CountUsers(ctx)
}

func (r *userRepositorySQLC) Create(ctx context.Context, u *entity.User) (*entity.User, error) {
	roleID := u.RoleID
	if roleID <= 0 {
		roleID = 1
	}

	created, err := r.querier.CreateUser(ctx, sqlc.CreateUserParams{
		FirstName:   textToPg(u.FirstName),
		LastName:    textToPg(u.LastName),
		Image:       textToPg(u.Image),
		UserName:    u.UserName,
		PhoneNumber: textToPg(u.PhoneNumber),
		DateOfBirth: timeToPg(u.DateOfBirth),
		Email:       u.Email,
		Password:    u.Password,
		RoleID:      int8ToPg(roleID),
	})
	if err != nil {
		return nil, err
	}

	u.ID = created.ID
	u.CreatedAt = created.CreatedAt.Time
	u.UpdatedAt = created.UpdatedAt.Time
	u.RoleID = pgToInt8(created.RoleID)
	return u, nil
}

func (r *userRepositorySQLC) Update(ctx context.Context, u *entity.User) (*entity.User, error) {
	updated, err := r.querier.UpdateUser(ctx, sqlc.UpdateUserParams{
		ID:          u.ID,
		FirstName:   textToPg(u.FirstName),
		LastName:    textToPg(u.LastName),
		Image:       textToPg(u.Image),
		UserName:    u.UserName,
		PhoneNumber: textToPg(u.PhoneNumber),
		Email:       u.Email,
		RoleID:      int8ToPg(u.RoleID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	u.UpdatedAt = updated.UpdatedAt.Time
	return u, nil
}

func (r *userRepositorySQLC) UpdateProfile(ctx context.Context, u *entity.User) (*entity.User, error) {
	updated, err := r.querier.UpdateUserProfile(ctx, sqlc.UpdateUserProfileParams{
		ID:          u.ID,
		FirstName:   textToPg(u.FirstName),
		LastName:    textToPg(u.LastName),
		Image:       textToPg(u.Image),
		PhoneNumber: textToPg(u.PhoneNumber),
		Email:       u.Email,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}

	u.UpdatedAt = updated.UpdatedAt.Time
	return u, nil
}

func (r *userRepositorySQLC) UpdatePassword(ctx context.Context, id int64, hashedPassword string) error {
	return r.querier.UpdateUserPassword(ctx, sqlc.UpdateUserPasswordParams{
		ID:       id,
		Password: hashedPassword,
	})
}

func (r *userRepositorySQLC) Delete(ctx context.Context, id int64) error {
	return r.querier.DeleteUser(ctx, id)
}

// Type conversion helpers
func textToPg(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: s != ""}
}

func pgToText(t pgtype.Text) string {
	if t.Valid {
		return t.String
	}
	return ""
}

func timeToPg(t *time.Time) pgtype.Timestamptz {
	if t == nil {
		return pgtype.Timestamptz{Valid: false}
	}
	return pgtype.Timestamptz{Time: *t, Valid: true}
}

func pgToTime(t pgtype.Timestamptz) *time.Time {
	if t.Valid {
		return &t.Time
	}
	return nil
}

func int8ToPg(i int64) pgtype.Int8 {
	return pgtype.Int8{Int64: i, Valid: i > 0}
}

func pgToInt8(i pgtype.Int8) int64 {
	if i.Valid {
		return i.Int64
	}
	return 0
}
