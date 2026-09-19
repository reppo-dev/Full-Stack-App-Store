package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/reppo/go-backend/internal/domain"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

type BannerRepositorySQLC struct {
	queries *sqlc.Queries
}

func NewBannerRepositorySQLC(queries *sqlc.Queries) repository.BannerRepository {
	return &BannerRepositorySQLC{queries: queries}
}

func (r *BannerRepositorySQLC) toEntity(b sqlc.Banner) *entity.Banner {
	return &entity.Banner{
		ID:        b.ID,
		CreatedAt: b.CreatedAt.Time,
		UpdatedAt: b.UpdatedAt.Time,
		Title:     b.Title,
		Subtitle:  b.Subtitle.String,
		Badge:     b.Badge.String,
		ImageURL:  b.ImageUrl,
		LinkURL:   b.LinkUrl,
		CtaText:   b.CtaText.String,
		CtaLink:   b.CtaLink.String,
		Type:      entity.BannerType(b.Type),
		Position:  b.Position,
		IsActive:  b.IsActive,
	}
}

func (r *BannerRepositorySQLC) ListActiveByType(ctx context.Context, bannerType string) ([]*entity.Banner, error) {
	var typeParam pgtype.Text
	if bannerType != "" {
		typeParam = pgtype.Text{String: bannerType, Valid: true}
	}

	rows, err := r.queries.ListActiveBannersByType(ctx, typeParam)
	if err != nil {
		return nil, err
	}

	res := make([]*entity.Banner, len(rows))
	for i, row := range rows {
		res[i] = r.toEntity(row)
	}
	return res, nil
}

func (r *BannerRepositorySQLC) ListAll(ctx context.Context) ([]*entity.Banner, error) {
	rows, err := r.queries.ListAllBanners(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]*entity.Banner, len(rows))
	for i, row := range rows {
		res[i] = r.toEntity(row)
	}
	return res, nil
}

func (r *BannerRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Banner, error) {
	b, err := r.queries.GetBannerByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrBannerNotFound
		}
		return nil, err
	}
	return r.toEntity(b), nil
}

func (r *BannerRepositorySQLC) Create(ctx context.Context, banner *entity.Banner) (*entity.Banner, error) {
	arg := sqlc.CreateBannerParams{
		Title:    banner.Title,
		Subtitle: pgtype.Text{String: banner.Subtitle, Valid: banner.Subtitle != ""},
		Badge:    pgtype.Text{String: banner.Badge, Valid: banner.Badge != ""},
		ImageUrl: banner.ImageURL,
		LinkUrl:  banner.LinkURL,
		CtaText:  pgtype.Text{String: banner.CtaText, Valid: banner.CtaText != ""},
		CtaLink:  pgtype.Text{String: banner.CtaLink, Valid: banner.CtaLink != ""},
		Type:     string(banner.Type),
		Position: banner.Position,
		IsActive: banner.IsActive,
	}

	created, err := r.queries.CreateBanner(ctx, arg)
	if err != nil {
		return nil, err
	}
	return r.toEntity(created), nil
}

func (r *BannerRepositorySQLC) Update(ctx context.Context, banner *entity.Banner) (*entity.Banner, error) {
	arg := sqlc.UpdateBannerParams{
		ID:       banner.ID,
		Title:    banner.Title,
		Subtitle: pgtype.Text{String: banner.Subtitle, Valid: banner.Subtitle != ""},
		Badge:    pgtype.Text{String: banner.Badge, Valid: banner.Badge != ""},
		ImageUrl: banner.ImageURL,
		LinkUrl:  banner.LinkURL,
		CtaText:  pgtype.Text{String: banner.CtaText, Valid: banner.CtaText != ""},
		CtaLink:  pgtype.Text{String: banner.CtaLink, Valid: banner.CtaLink != ""},
		Type:     string(banner.Type),
		Position: banner.Position,
		IsActive: banner.IsActive,
	}

	updated, err := r.queries.UpdateBanner(ctx, arg)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrBannerNotFound
		}
		return nil, err
	}
	return r.toEntity(updated), nil
}

func (r *BannerRepositorySQLC) Delete(ctx context.Context, id int64) error {
	return r.queries.DeleteBanner(ctx, id)
}
