package service

import (
	"context"
	"errors"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

// CategoryService orchestrates category browsing and administration.
type CategoryService struct {
	categoryRepo repository.CategoryRepository
}

// NewCategoryService constructs a new CategoryService instance.
func NewCategoryService(categoryRepo repository.CategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

// GetByID returns a category by primary key ID.
func (s *CategoryService) GetByID(ctx context.Context, id int64) (*dto.CategoryViewDTO, error) {
	cat, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	view := toCategoryViewDTO(cat)
	return &view, nil
}

// GetBySlug returns a category by unique SEO slug.
func (s *CategoryService) GetBySlug(ctx context.Context, slug string) (*dto.CategoryViewDTO, error) {
	cat, err := s.categoryRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	view := toCategoryViewDTO(cat)
	return &view, nil
}

// List returns a flat list of all active categories.
func (s *CategoryService) List(ctx context.Context) ([]dto.CategoryViewDTO, error) {
	cats, err := s.categoryRepo.List(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.CategoryViewDTO, len(cats))
	for i, c := range cats {
		views[i] = toCategoryViewDTO(c)
	}
	return views, nil
}

// GetTree returns a nested parent-child category hierarchy.
func (s *CategoryService) GetTree(ctx context.Context) ([]dto.CategoryViewDTO, error) {
	tree, err := s.categoryRepo.GetTree(ctx)
	if err != nil {
		return nil, err
	}

	views := make([]dto.CategoryViewDTO, len(tree))
	for i, c := range tree {
		views[i] = toCategoryTreeDTO(c)
	}
	return views, nil
}

// Create registers a new product category.
func (s *CategoryService) Create(ctx context.Context, input dto.CreateCategoryDTO) (*dto.CategoryViewDTO, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("category name is required")
	}

	cat := &entity.Category{
		Name:     input.Name,
		Slug:     input.Slug,
		ParentID: input.ParentID,
	}

	created, err := s.categoryRepo.Create(ctx, cat)
	if err != nil {
		return nil, err
	}

	view := toCategoryViewDTO(created)
	return &view, nil
}

// Update modifies an existing category's details.
func (s *CategoryService) Update(ctx context.Context, id int64, input dto.UpdateCategoryDTO) (*dto.CategoryViewDTO, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("category name is required")
	}

	cat := &entity.Category{
		ID:       id,
		Name:     input.Name,
		Slug:     input.Slug,
		ParentID: input.ParentID,
	}

	updated, err := s.categoryRepo.Update(ctx, cat)
	if err != nil {
		return nil, err
	}

	view := toCategoryViewDTO(updated)
	return &view, nil
}

// Delete removes a category.
func (s *CategoryService) Delete(ctx context.Context, id int64) error {
	return s.categoryRepo.Delete(ctx, id)
}

func toCategoryViewDTO(c *entity.Category) dto.CategoryViewDTO {
	return dto.CategoryViewDTO{
		ID:        c.ID,
		Name:      c.Name,
		Slug:      c.Slug,
		ParentID:  c.ParentID,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

func toCategoryTreeDTO(c *entity.Category) dto.CategoryViewDTO {
	children := make([]dto.CategoryViewDTO, len(c.Children))
	for i, ch := range c.Children {
		children[i] = dto.CategoryViewDTO{
			ID:        ch.ID,
			Name:      ch.Name,
			Slug:      ch.Slug,
			ParentID:  ch.ParentID,
			CreatedAt: ch.CreatedAt,
			UpdatedAt: ch.UpdatedAt,
		}
	}
	return dto.CategoryViewDTO{
		ID:        c.ID,
		Name:      c.Name,
		Slug:      c.Slug,
		ParentID:  c.ParentID,
		Children:  children,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}
