package service

import (
	"context"
	"errors"
	"math"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

// ProductService orchestrates product catalog browsing, discovery, and administration.
type ProductService struct {
	productRepo repository.ProductRepository
}

// NewProductService constructs a new ProductService instance.
func NewProductService(productRepo repository.ProductRepository) *ProductService {
	return &ProductService{productRepo: productRepo}
}

// GetByID retrieves a product by its unique integer identifier.
func (s *ProductService) GetByID(ctx context.Context, id int64) (*dto.ProductViewDTO, error) {
	prod, err := s.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	view := toProductViewDTO(prod)
	return &view, nil
}

// GetBySlug retrieves a product by its unique SEO slug.
func (s *ProductService) GetBySlug(ctx context.Context, slug string) (*dto.ProductViewDTO, error) {
	prod, err := s.productRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	view := toProductViewDTO(prod)
	return &view, nil
}

// List returns a paginated list of catalog products filtered by optional category and active flag.
func (s *ProductService) List(
	ctx context.Context,
	page, pageSize int32,
	categoryID *int64,
	isActive *bool,
) (*dto.ProductPaginationDTO, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 15
	}

	offset := (page - 1) * pageSize
	params := repository.ProductListParams{
		Limit:      pageSize,
		Offset:     offset,
		CategoryID: categoryID,
		IsActive:   isActive,
	}

	products, err := s.productRepo.List(ctx, params)
	if err != nil {
		return nil, err
	}

	total, err := s.productRepo.Count(ctx, params)
	if err != nil {
		return nil, err
	}

	lastPage := int32(math.Ceil(float64(total) / float64(pageSize)))
	if lastPage < 1 {
		lastPage = 1
	}

	views := make([]dto.ProductViewDTO, len(products))
	for i, p := range products {
		views[i] = toProductViewDTO(p)
	}

	return &dto.ProductPaginationDTO{
		Data:     views,
		Total:    total,
		Page:     page,
		LastPage: lastPage,
	}, nil
}

// ListAll returns all products without pagination.
func (s *ProductService) ListAll(ctx context.Context) ([]dto.ProductViewDTO, error) {
	products, err := s.productRepo.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.ProductViewDTO, len(products))
	for i, p := range products {
		views[i] = toProductViewDTO(p)
	}
	return views, nil
}

// Create registers a new product in the catalog.
func (s *ProductService) Create(ctx context.Context, input dto.CreateProductDTO) (*dto.ProductViewDTO, error) {
	if strings.TrimSpace(input.Title) == "" {
		return nil, errors.New("product title is required")
	}
	if input.Price < 0 {
		return nil, errors.New("product price cannot be negative")
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	prod := &entity.Product{
		Title:       input.Title,
		Slug:        input.Slug,
		Description: input.Description,
		Price:       input.Price,
		Stock:       input.Stock,
		Rating:      input.Rating,
		Images:      input.Images,
		Colors:      input.Colors,
		Attributes:  input.Attributes,
		CategoryID:  input.CategoryID,
		SKU:         input.SKU,
		IsActive:    isActive,
	}

	created, err := s.productRepo.Create(ctx, prod)
	if err != nil {
		return nil, err
	}

	view := toProductViewDTO(created)
	return &view, nil
}

// Update modifies product details.
func (s *ProductService) Update(ctx context.Context, id int64, input dto.UpdateProductDTO) (*dto.ProductViewDTO, error) {
	existing, err := s.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Title != nil {
		existing.Title = *input.Title
	}
	if input.Slug != nil {
		existing.Slug = *input.Slug
	}
	if input.Description != nil {
		existing.Description = *input.Description
	}
	if input.Price != nil {
		existing.Price = *input.Price
	}
	if input.Stock != nil {
		existing.Stock = *input.Stock
	}
	if input.Rating != nil {
		existing.Rating = *input.Rating
	}
	if input.Images != nil {
		existing.Images = input.Images
	}
	if input.Colors != nil {
		existing.Colors = input.Colors
	}
	if input.Attributes != nil {
		existing.Attributes = input.Attributes
	}
	if input.CategoryID != nil {
		existing.CategoryID = input.CategoryID
	}
	if input.SKU != nil {
		existing.SKU = *input.SKU
	}
	if input.IsActive != nil {
		existing.IsActive = *input.IsActive
	}

	updated, err := s.productRepo.Update(ctx, existing)
	if err != nil {
		return nil, err
	}

	view := toProductViewDTO(updated)
	return &view, nil
}

// Delete removes a product.
func (s *ProductService) Delete(ctx context.Context, id int64) error {
	return s.productRepo.Delete(ctx, id)
}

func toProductViewDTO(p *entity.Product) dto.ProductViewDTO {
	return dto.ProductViewDTO{
		ID:           p.ID,
		Title:        p.Title,
		Slug:         p.Slug,
		Description:  p.Description,
		Price:        p.Price,
		Stock:        p.Stock,
		Rating:       p.Rating,
		Images:       p.Images,
		Colors:       p.Colors,
		Attributes:   p.Attributes,
		CategoryID:   p.CategoryID,
		CategoryName: p.CategoryName,
		SKU:          p.SKU,
		IsActive:     p.IsActive,
		CreatedAt:    p.CreatedAt,
		UpdatedAt:    p.UpdatedAt,
	}
}
