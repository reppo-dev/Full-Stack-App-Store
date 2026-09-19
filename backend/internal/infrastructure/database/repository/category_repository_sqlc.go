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
	"github.com/reppo/go-backend/internal/infrastructure/cache"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
)

const (
	categoryTreeCacheKey = "catalog:categories:tree"
	categoryTreeTTL      = 24 * time.Hour
)

type categoryRepositorySQLC struct {
	querier sqlc.Querier
	cache   cache.Cache
}

// NewCategoryRepositorySQLC creates an implementation of domain.CategoryRepository with Redis caching.
func NewCategoryRepositorySQLC(querier sqlc.Querier, c cache.Cache) repository.CategoryRepository {
	if c == nil {
		c = cache.NewNoopCache()
	}
	return &categoryRepositorySQLC{
		querier: querier,
		cache:   c,
	}
}

func (r *categoryRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Category, error) {
	row, err := r.querier.GetCategoryByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrCategoryNotFound
		}
		return nil, err
	}

	return toCategoryEntity(row), nil
}

func (r *categoryRepositorySQLC) GetBySlug(ctx context.Context, slug string) (*entity.Category, error) {
	row, err := r.querier.GetCategoryBySlug(ctx, textToPg(slug))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrCategoryNotFound
		}
		return nil, err
	}

	return toCategoryEntity(row), nil
}

func (r *categoryRepositorySQLC) List(ctx context.Context) ([]*entity.Category, error) {
	rows, err := r.querier.ListCategories(ctx)
	if err != nil {
		return nil, err
	}

	categories := make([]*entity.Category, len(rows))
	for i, row := range rows {
		categories[i] = toCategoryEntity(row)
	}
	return categories, nil
}

func (r *categoryRepositorySQLC) GetTree(ctx context.Context) ([]*entity.Category, error) {
	// 1. Check Redis Cache
	var cachedTree []*entity.Category
	if err := r.cache.Get(ctx, categoryTreeCacheKey, &cachedTree); err == nil && len(cachedTree) > 0 {
		return cachedTree, nil
	}

	// 2. Fetch all categories from database
	rows, err := r.querier.ListCategories(ctx)
	if err != nil {
		return nil, err
	}

	// 3. Assemble hierarchy tree
	categoryMap := make(map[int64]*entity.Category)
	for _, row := range rows {
		cat := toCategoryEntity(row)
		cat.Children = []entity.Category{}
		categoryMap[cat.ID] = cat
	}

	var rootCategories []*entity.Category
	for _, row := range rows {
		cat := categoryMap[row.ID]
		if row.ParentID.Valid && row.ParentID.Int64 > 0 {
			if parent, exists := categoryMap[row.ParentID.Int64]; exists {
				parent.Children = append(parent.Children, *cat)
			} else {
				rootCategories = append(rootCategories, cat)
			}
		} else {
			rootCategories = append(rootCategories, cat)
		}
	}

	// 4. Populate Cache
	_ = r.cache.Set(ctx, categoryTreeCacheKey, rootCategories, categoryTreeTTL)

	return rootCategories, nil
}

func (r *categoryRepositorySQLC) Create(ctx context.Context, cat *entity.Category) (*entity.Category, error) {
	created, err := r.querier.CreateCategory(ctx, sqlc.CreateCategoryParams{
		Name:     cat.Name,
		Slug:     textToPg(cat.Slug),
		ParentID: int8ToPgPtr(cat.ParentID),
	})
	if err != nil {
		return nil, err
	}

	_ = r.cache.Delete(ctx, categoryTreeCacheKey)

	cat.ID = created.ID
	cat.CreatedAt = created.CreatedAt.Time
	cat.UpdatedAt = created.UpdatedAt.Time
	return cat, nil
}

func (r *categoryRepositorySQLC) Update(ctx context.Context, cat *entity.Category) (*entity.Category, error) {
	updated, err := r.querier.UpdateCategory(ctx, sqlc.UpdateCategoryParams{
		ID:       cat.ID,
		Name:     cat.Name,
		Slug:     textToPg(cat.Slug),
		ParentID: int8ToPgPtr(cat.ParentID),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrCategoryNotFound
		}
		return nil, err
	}

	_ = r.cache.Delete(ctx, categoryTreeCacheKey)

	cat.UpdatedAt = updated.UpdatedAt.Time
	return cat, nil
}

func (r *categoryRepositorySQLC) Delete(ctx context.Context, id int64) error {
	err := r.querier.DeleteCategory(ctx, id)
	if err == nil {
		_ = r.cache.Delete(ctx, categoryTreeCacheKey)
	}
	return err
}

func toCategoryEntity(row sqlc.Category) *entity.Category {
	var parentID *int64
	if row.ParentID.Valid {
		p := row.ParentID.Int64
		parentID = &p
	}
	return &entity.Category{
		ID:        row.ID,
		Name:      row.Name,
		Slug:      pgToText(row.Slug),
		ParentID:  parentID,
		CreatedAt: row.CreatedAt.Time,
		UpdatedAt: row.UpdatedAt.Time,
		DeletedAt: pgToTime(row.DeletedAt),
	}
}

func int8ToPgPtr(i *int64) pgtype.Int8 {
	if i == nil || *i <= 0 {
		return pgtype.Int8{Valid: false}
	}
	return pgtype.Int8{Int64: *i, Valid: true}
}
