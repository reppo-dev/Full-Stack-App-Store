package repository

import (
	"context"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

type dynamicUIRepository struct {
	q *sqlc.Queries
}

func NewDynamicUIRepository(q *sqlc.Queries) *dynamicUIRepository {
	return &dynamicUIRepository{q: q}
}

func (r *dynamicUIRepository) ListBrands(ctx context.Context) ([]*entity.Brand, error) {
	rows, err := r.q.ListBrands(ctx)
	if err != nil {
		return nil, err
	}

	var brands []*entity.Brand
	for _, row := range rows {
		brands = append(brands, &entity.Brand{
			ID:        row.ID,
			CreatedAt: row.CreatedAt.Time,
			UpdatedAt: row.UpdatedAt.Time,
			Name:      row.Name,
			Category:  nullableString(row.Category),
			Href:      nullableString(row.Href),
			IsActive:  row.IsActive,
		})
	}
	return brands, nil
}

func (r *dynamicUIRepository) ListStories(ctx context.Context) ([]*entity.Story, error) {
	rows, err := r.q.ListStories(ctx)
	if err != nil {
		return nil, err
	}

	var stories []*entity.Story
	for _, row := range rows {
		stories = append(stories, &entity.Story{
			ID:            row.ID,
			CreatedAt:     row.CreatedAt.Time,
			UpdatedAt:     row.UpdatedAt.Time,
			Title:         row.Title,
			Subtitle:      nullableString(row.Subtitle),
			Badge:         nullableString(row.Badge),
			Category:      nullableString(row.Category),
			ImageURL:      row.ImageUrl,
			LinkURL:       nullableString(row.LinkUrl),
			ButtonText:    nullableString(row.ButtonText),
			GradientClass: nullableString(row.GradientClass),
			IconName:      nullableString(row.IconName),
			FeaturedPrice: nullableString(row.FeaturedPrice),
			IsActive:      row.IsActive.Bool,
		})
	}
	return stories, nil
}

func nullableString(s pgtype.Text) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}
