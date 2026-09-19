package service

import (
	"context"
	"strings"

	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/domain/entity"
	"github.com/reppo/go-backend/internal/domain/repository"
)

type BannerService struct {
	bannerRepo repository.BannerRepository
}

func NewBannerService(bannerRepo repository.BannerRepository) *BannerService {
	return &BannerService{bannerRepo: bannerRepo}
}

func (s *BannerService) toDTO(b *entity.Banner) *dto.BannerViewDTO {
	return &dto.BannerViewDTO{
		ID:        b.ID,
		CreatedAt: b.CreatedAt,
		UpdatedAt: b.UpdatedAt,
		Title:     b.Title,
		Subtitle:  b.Subtitle,
		Badge:     b.Badge,
		ImageURL:  b.ImageURL,
		LinkURL:   b.LinkURL,
		CtaText:   b.CtaText,
		CtaLink:   b.CtaLink,
		Type:      string(b.Type),
		Position:  b.Position,
		IsActive:  b.IsActive,
	}
}

func (s *BannerService) ListActiveBanners(ctx context.Context, bannerType string) ([]*dto.BannerViewDTO, error) {
	banners, err := s.bannerRepo.ListActiveByType(ctx, strings.TrimSpace(bannerType))
	if err != nil {
		return nil, err
	}

	res := make([]*dto.BannerViewDTO, len(banners))
	for i, b := range banners {
		res[i] = s.toDTO(b)
	}
	return res, nil
}

func (s *BannerService) ListAllBanners(ctx context.Context) ([]*dto.BannerViewDTO, error) {
	banners, err := s.bannerRepo.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.BannerViewDTO, len(banners))
	for i, b := range banners {
		res[i] = s.toDTO(b)
	}
	return res, nil
}

func (s *BannerService) GetBannerByID(ctx context.Context, id int64) (*dto.BannerViewDTO, error) {
	b, err := s.bannerRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return s.toDTO(b), nil
}

func (s *BannerService) CreateBanner(ctx context.Context, input dto.CreateBannerDTO) (*dto.BannerViewDTO, error) {
	bannerType := entity.BannerTypeHero
	if strings.ToLower(input.Type) == "promo" {
		bannerType = entity.BannerTypePromo
	}

	linkURL := strings.TrimSpace(input.LinkURL)
	if linkURL == "" {
		linkURL = "/products"
	}

	ctaLink := strings.TrimSpace(input.CtaLink)
	if ctaLink == "" {
		ctaLink = linkURL
	}

	ctaText := strings.TrimSpace(input.CtaText)
	if ctaText == "" {
		ctaText = "Shop Now"
	}

	banner := &entity.Banner{
		Title:    input.Title,
		Subtitle: input.Subtitle,
		Badge:    input.Badge,
		ImageURL: input.ImageURL,
		LinkURL:  linkURL,
		CtaText:  ctaText,
		CtaLink:  ctaLink,
		Type:     bannerType,
		Position: input.Position,
		IsActive: input.IsActive,
	}

	created, err := s.bannerRepo.Create(ctx, banner)
	if err != nil {
		return nil, err
	}
	return s.toDTO(created), nil
}

func (s *BannerService) UpdateBanner(ctx context.Context, id int64, input dto.UpdateBannerDTO) (*dto.BannerViewDTO, error) {
	existing, err := s.bannerRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	bannerType := entity.BannerTypeHero
	if strings.ToLower(input.Type) == "promo" {
		bannerType = entity.BannerTypePromo
	}

	linkURL := strings.TrimSpace(input.LinkURL)
	if linkURL == "" {
		linkURL = "/products"
	}

	ctaLink := strings.TrimSpace(input.CtaLink)
	if ctaLink == "" {
		ctaLink = linkURL
	}

	existing.Title = input.Title
	existing.Subtitle = input.Subtitle
	existing.Badge = input.Badge
	existing.ImageURL = input.ImageURL
	existing.LinkURL = linkURL
	existing.CtaText = input.CtaText
	existing.CtaLink = ctaLink
	existing.Type = bannerType
	existing.Position = input.Position
	existing.IsActive = input.IsActive

	updated, err := s.bannerRepo.Update(ctx, existing)
	if err != nil {
		return nil, err
	}
	return s.toDTO(updated), nil
}

func (s *BannerService) DeleteBanner(ctx context.Context, id int64) error {
	_, err := s.bannerRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return s.bannerRepo.Delete(ctx, id)
}
