package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/application/dto"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// FavoriteHandler handles HTTP endpoints for customer wishlists without IDOR vulnerability.
type FavoriteHandler struct {
	favoriteService *service.FavoriteService
}

// NewFavoriteHandler constructs a new FavoriteHandler instance.
func NewFavoriteHandler(favoriteService *service.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{favoriteService: favoriteService}
}

// ListFavorites returns all wishlisted items for the caller.
func (h *FavoriteHandler) ListFavorites(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(int64)
	if !ok || uid <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	favs, err := h.favoriteService.List(c.Context(), uid)
	if err != nil {
		return response.InternalServerError(c, "failed to retrieve favorites")
	}

	return response.Success(c, fiber.StatusOK, favs)
}

// AddFavorite adds a product to the caller's wishlist.
func (h *FavoriteHandler) AddFavorite(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(int64)
	if !ok || uid <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	var input dto.AddFavoriteDTO
	if err := c.BodyParser(&input); err != nil {
		return response.BadRequest(c, "INVALID_PAYLOAD", "invalid request payload")
	}

	fav, err := h.favoriteService.Add(c.Context(), uid, input.ProductID)
	if err != nil {
		return response.BadRequest(c, "ADD_FAVORITE_FAILED", err.Error())
	}

	return response.Created(c, fav)
}

// RemoveFavorite removes a product from the caller's wishlist.
func (h *FavoriteHandler) RemoveFavorite(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(int64)
	if !ok || uid <= 0 {
		return response.Unauthorized(c, "authenticated user required")
	}

	productID, err := strconv.ParseInt(c.Params("product_id"), 10, 64)
	if err != nil || productID <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid product ID")
	}

	if err := h.favoriteService.Remove(c.Context(), uid, productID); err != nil {
		return response.InternalServerError(c, "failed to remove favorite")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"message": "favorite removed",
	})
}

// CheckFavorite returns whether a product is currently wishlisted by caller.
func (h *FavoriteHandler) CheckFavorite(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(int64)
	if !ok || uid <= 0 {
		return response.Success(c, fiber.StatusOK, fiber.Map{"is_favorite": false})
	}

	productID, err := strconv.ParseInt(c.Params("product_id"), 10, 64)
	if err != nil || productID <= 0 {
		return response.BadRequest(c, "INVALID_ID", "invalid product ID")
	}

	isFav, err := h.favoriteService.IsFavorite(c.Context(), uid, productID)
	if err != nil {
		return response.InternalServerError(c, "failed to check favorite status")
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"is_favorite": isFav,
	})
}
