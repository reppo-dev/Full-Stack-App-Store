package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
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
	productCachePrefix     = "catalog:product:"
	productSlugCachePrefix = "catalog:product:slug:"
	productTTL             = 1 * time.Hour
)

type productRepositorySQLC struct {
	querier sqlc.Querier
	cache   cache.Cache
}

// NewProductRepositorySQLC creates an implementation of domain.ProductRepository with Redis caching.
func NewProductRepositorySQLC(querier sqlc.Querier, c cache.Cache) repository.ProductRepository {
	if c == nil {
		c = cache.NewNoopCache()
	}
	return &productRepositorySQLC{
		querier: querier,
		cache:   c,
	}
}

func (r *productRepositorySQLC) GetByID(ctx context.Context, id int64) (*entity.Product, error) {
	cacheKey := fmt.Sprintf("%s%d", productCachePrefix, id)
	var cachedProduct entity.Product
	if err := r.cache.Get(ctx, cacheKey, &cachedProduct); err == nil && cachedProduct.ID > 0 {
		return &cachedProduct, nil
	}

	row, err := r.querier.GetProductByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	product := toProductFromGetRow(row)
	_ = r.cache.Set(ctx, cacheKey, product, productTTL)
	return product, nil
}

func (r *productRepositorySQLC) GetBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	cacheKey := fmt.Sprintf("%s%s", productSlugCachePrefix, slug)
	var cachedProduct entity.Product
	if err := r.cache.Get(ctx, cacheKey, &cachedProduct); err == nil && cachedProduct.ID > 0 {
		return &cachedProduct, nil
	}

	row, err := r.querier.GetProductBySlug(ctx, textToPg(slug))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	product := toProductFromSlugRow(row)
	_ = r.cache.Set(ctx, cacheKey, product, productTTL)
	return product, nil
}

func (r *productRepositorySQLC) List(ctx context.Context, params repository.ProductListParams) ([]*entity.Product, error) {
	if params.CategoryID != nil && *params.CategoryID > 0 {
		rows, err := r.querier.ListProductsByCategory(ctx, sqlc.ListProductsByCategoryParams{
			CategoryID: int8ToPg(*params.CategoryID),
			Limit:      params.Limit,
			Offset:     params.Offset,
		})
		if err != nil {
			return nil, err
		}

		products := make([]*entity.Product, len(rows))
		for i, row := range rows {
			products[i] = toProductFromCategoryRow(row)
		}
		return products, nil
	}

	var isActivePg pgtype.Bool
	if params.IsActive != nil {
		isActivePg = pgtype.Bool{Bool: *params.IsActive, Valid: true}
	}

	rows, err := r.querier.ListProducts(ctx, sqlc.ListProductsParams{
		Limit:    params.Limit,
		Offset:   params.Offset,
		IsActive: isActivePg,
	})
	if err != nil {
		return nil, err
	}

	products := make([]*entity.Product, len(rows))
	for i, row := range rows {
		products[i] = toProductFromListRow(row)
	}
	return products, nil
}

func (r *productRepositorySQLC) ListAll(ctx context.Context) ([]*entity.Product, error) {
	rows, err := r.querier.ListAllProducts(ctx)
	if err != nil {
		return nil, err
	}

	products := make([]*entity.Product, len(rows))
	for i, row := range rows {
		products[i] = toProductFromListAllRow(row)
	}
	return products, nil
}

func (r *productRepositorySQLC) Count(ctx context.Context, params repository.ProductListParams) (int64, error) {
	if params.CategoryID != nil && *params.CategoryID > 0 {
		return r.querier.CountProductsByCategory(ctx, int8ToPg(*params.CategoryID))
	}

	var isActivePg pgtype.Bool
	if params.IsActive != nil {
		isActivePg = pgtype.Bool{Bool: *params.IsActive, Valid: true}
	}
	return r.querier.CountProducts(ctx, isActivePg)
}

func (r *productRepositorySQLC) Create(ctx context.Context, p *entity.Product) (*entity.Product, error) {
	created, err := r.querier.CreateProduct(ctx, sqlc.CreateProductParams{
		Title:       p.Title,
		Slug:        textToPg(p.Slug),
		Description: textToPg(p.Description),
		Price:       floatToNumeric(p.Price),
		Stock:       pgtype.Int4{Int32: p.Stock, Valid: true},
		Rating:      pgtype.Float8{Float64: p.Rating, Valid: true},
		Images:      sliceToJSON(p.Images),
		Colors:      sliceToJSON(p.Colors),
		Attributes:  mapToJSON(p.Attributes),
		CategoryID:  int8ToPgPtr(p.CategoryID),
		Sku:         textToPg(p.SKU),
		IsActive:    pgtype.Bool{Bool: p.IsActive, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	p.ID = created.ID
	p.CreatedAt = created.CreatedAt.Time
	p.UpdatedAt = created.UpdatedAt.Time
	return p, nil
}

func (r *productRepositorySQLC) Update(ctx context.Context, p *entity.Product) (*entity.Product, error) {
	updated, err := r.querier.UpdateProduct(ctx, sqlc.UpdateProductParams{
		ID:          p.ID,
		Title:       p.Title,
		Slug:        textToPg(p.Slug),
		Description: textToPg(p.Description),
		Price:       floatToNumeric(p.Price),
		Stock:       pgtype.Int4{Int32: p.Stock, Valid: true},
		Rating:      pgtype.Float8{Float64: p.Rating, Valid: true},
		Images:      sliceToJSON(p.Images),
		Colors:      sliceToJSON(p.Colors),
		Attributes:  mapToJSON(p.Attributes),
		CategoryID:  int8ToPgPtr(p.CategoryID),
		Sku:         textToPg(p.SKU),
		IsActive:    pgtype.Bool{Bool: p.IsActive, Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	// Cache Invalidation
	_ = r.cache.Delete(ctx, fmt.Sprintf("%s%d", productCachePrefix, p.ID))
	if p.Slug != "" {
		_ = r.cache.Delete(ctx, fmt.Sprintf("%s%s", productSlugCachePrefix, p.Slug))
	}

	p.UpdatedAt = updated.UpdatedAt.Time
	return p, nil
}

func (r *productRepositorySQLC) UpdateStock(ctx context.Context, id int64, newStock int32) error {
	err := r.querier.UpdateProductStock(ctx, sqlc.UpdateProductStockParams{
		ID:    id,
		Stock: pgtype.Int4{Int32: newStock, Valid: true},
	})
	if err == nil {
		_ = r.cache.Delete(ctx, fmt.Sprintf("%s%d", productCachePrefix, id))
	}
	return err
}

func (r *productRepositorySQLC) Delete(ctx context.Context, id int64) error {
	err := r.querier.DeleteProduct(ctx, id)
	if err == nil {
		_ = r.cache.Delete(ctx, fmt.Sprintf("%s%d", productCachePrefix, id))
	}
	return err
}

// Conversions
func toProductFromGetRow(row sqlc.GetProductByIDRow) *entity.Product {
	var catID *int64
	if row.CategoryID.Valid {
		c := row.CategoryID.Int64
		catID = &c
	}
	return &entity.Product{
		ID:           row.ID,
		Title:        row.Title,
		Slug:         pgToText(row.Slug),
		Description:  pgToText(row.Description),
		Price:        numericToFloat(row.Price),
		Stock:        row.Stock.Int32,
		Rating:       row.Rating.Float64,
		Images:       jsonToSlice(row.Images),
		Colors:       jsonToSlice(row.Colors),
		Attributes:   jsonToMap(row.Attributes),
		CategoryID:   catID,
		CategoryName: row.CategoryName,
		SKU:          pgToText(row.Sku),
		IsActive:     row.IsActive.Bool,
		CreatedAt:    row.CreatedAt.Time,
		UpdatedAt:    row.UpdatedAt.Time,
		DeletedAt:    pgToTime(row.DeletedAt),
	}
}

func toProductFromSlugRow(row sqlc.GetProductBySlugRow) *entity.Product {
	var catID *int64
	if row.CategoryID.Valid {
		c := row.CategoryID.Int64
		catID = &c
	}
	return &entity.Product{
		ID:           row.ID,
		Title:        row.Title,
		Slug:         pgToText(row.Slug),
		Description:  pgToText(row.Description),
		Price:        numericToFloat(row.Price),
		Stock:        row.Stock.Int32,
		Rating:       row.Rating.Float64,
		Images:       jsonToSlice(row.Images),
		Colors:       jsonToSlice(row.Colors),
		Attributes:   jsonToMap(row.Attributes),
		CategoryID:   catID,
		CategoryName: row.CategoryName,
		SKU:          pgToText(row.Sku),
		IsActive:     row.IsActive.Bool,
		CreatedAt:    row.CreatedAt.Time,
		UpdatedAt:    row.UpdatedAt.Time,
		DeletedAt:    pgToTime(row.DeletedAt),
	}
}

func toProductFromListRow(row sqlc.ListProductsRow) *entity.Product {
	var catID *int64
	if row.CategoryID.Valid {
		c := row.CategoryID.Int64
		catID = &c
	}
	return &entity.Product{
		ID:           row.ID,
		Title:        row.Title,
		Slug:         pgToText(row.Slug),
		Description:  pgToText(row.Description),
		Price:        numericToFloat(row.Price),
		Stock:        row.Stock.Int32,
		Rating:       row.Rating.Float64,
		Images:       jsonToSlice(row.Images),
		Colors:       jsonToSlice(row.Colors),
		Attributes:   jsonToMap(row.Attributes),
		CategoryID:   catID,
		CategoryName: row.CategoryName,
		SKU:          pgToText(row.Sku),
		IsActive:     row.IsActive.Bool,
		CreatedAt:    row.CreatedAt.Time,
		UpdatedAt:    row.UpdatedAt.Time,
		DeletedAt:    pgToTime(row.DeletedAt),
	}
}

func toProductFromCategoryRow(row sqlc.ListProductsByCategoryRow) *entity.Product {
	var catID *int64
	if row.CategoryID.Valid {
		c := row.CategoryID.Int64
		catID = &c
	}
	return &entity.Product{
		ID:           row.ID,
		Title:        row.Title,
		Slug:         pgToText(row.Slug),
		Description:  pgToText(row.Description),
		Price:        numericToFloat(row.Price),
		Stock:        row.Stock.Int32,
		Rating:       row.Rating.Float64,
		Images:       jsonToSlice(row.Images),
		Colors:       jsonToSlice(row.Colors),
		Attributes:   jsonToMap(row.Attributes),
		CategoryID:   catID,
		CategoryName: row.CategoryName,
		SKU:          pgToText(row.Sku),
		IsActive:     row.IsActive.Bool,
		CreatedAt:    row.CreatedAt.Time,
		UpdatedAt:    row.UpdatedAt.Time,
		DeletedAt:    pgToTime(row.DeletedAt),
	}
}

func toProductFromListAllRow(row sqlc.ListAllProductsRow) *entity.Product {
	var catID *int64
	if row.CategoryID.Valid {
		c := row.CategoryID.Int64
		catID = &c
	}
	return &entity.Product{
		ID:           row.ID,
		Title:        row.Title,
		Slug:         pgToText(row.Slug),
		Description:  pgToText(row.Description),
		Price:        numericToFloat(row.Price),
		Stock:        row.Stock.Int32,
		Rating:       row.Rating.Float64,
		Images:       jsonToSlice(row.Images),
		Colors:       jsonToSlice(row.Colors),
		Attributes:   jsonToMap(row.Attributes),
		CategoryID:   catID,
		CategoryName: row.CategoryName,
		SKU:          pgToText(row.Sku),
		IsActive:     row.IsActive.Bool,
		CreatedAt:    row.CreatedAt.Time,
		UpdatedAt:    row.UpdatedAt.Time,
		DeletedAt:    pgToTime(row.DeletedAt),
	}
}

func floatToNumeric(f float64) pgtype.Numeric {
	var num pgtype.Numeric
	_ = num.Scan(fmt.Sprintf("%.2f", f))
	return num
}

func numericToFloat(num pgtype.Numeric) float64 {
	val, err := num.Float64Value()
	if err != nil || !val.Valid {
		return 0
	}
	return val.Float64
}

func sliceToJSON(s []string) []byte {
	if len(s) == 0 {
		return []byte("[]")
	}
	b, _ := json.Marshal(s)
	return b
}

func jsonToSlice(b []byte) []string {
	if len(b) == 0 {
		return []string{}
	}
	var s []string
	_ = json.Unmarshal(b, &s)
	return s
}

func mapToJSON(m map[string]interface{}) []byte {
	if len(m) == 0 {
		return []byte("{}")
	}
	b, _ := json.Marshal(m)
	return b
}

func jsonToMap(b []byte) map[string]interface{} {
	if len(b) == 0 {
		return make(map[string]interface{})
	}
	var m map[string]interface{}
	_ = json.Unmarshal(b, &m)
	return m
}
