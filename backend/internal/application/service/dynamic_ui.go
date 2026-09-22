package service

import (
	"context"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type DynamicUIService interface {
	GetActiveBrands(ctx context.Context) ([]*entity.Brand, error)
	GetActiveStories(ctx context.Context) ([]*entity.Story, error)
}

type dynamicUIService struct {
	repo repository.DynamicUIRepository
}

func NewDynamicUIService(repo repository.DynamicUIRepository) DynamicUIService {
	return &dynamicUIService{repo: repo}
}

func (s *dynamicUIService) GetActiveBrands(ctx context.Context) ([]*entity.Brand, error) {
	return s.repo.ListBrands(ctx)
}

func (s *dynamicUIService) GetActiveStories(ctx context.Context) ([]*entity.Story, error) {
	return s.repo.ListStories(ctx)
}
