package controllers

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"gorm.io/gorm/clause"
)

func getCallerId(c *fiber.Ctx) (uint, error) {
	userIdVal := c.Locals("userId")
	if userIdVal == nil {
		return 0, errors.New("unauthenticated")
	}
	userIdStr, ok := userIdVal.(string)
	if !ok || userIdStr == "" {
		return 0, errors.New("unauthenticated")
	}
	id, err := strconv.Atoi(userIdStr)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid user id")
	}
	return uint(id), nil
}

func AllFavorite(c *fiber.Ctx) error {
	callerID, err := getCallerId(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthenticated"})
	}

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	if uint(id) != callerID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "forbidden: cannot modify another user's resources",
		})
	}

	var favorite []models.Favorite
	databases.DB.Where("user_id = ?", id).Preload("Product").Find(&favorite)

	return c.JSON(favorite)
}

func AddFavorite(c *fiber.Ctx) error {
	callerID, err := getCallerId(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthenticated"})
	}

	var input struct {
		UserID    uint `json:"user_id"`
		ProductID uint `json:"product_id"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.UserID != callerID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "forbidden: cannot modify another user's resources",
		})
	}

	fav := models.Favorite{
		UserID:    input.UserID,
		ProductID: input.ProductID,
	}

	result := databases.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&fav)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	if result.RowsAffected == 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Already in favorites"})
	}

	return c.Status(201).JSON(fav)
}

func RemoveFavorite(c *fiber.Ctx) error {
	callerID, err := getCallerId(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "unauthenticated"})
	}

	var input struct {
		UserID    uint `json:"user_id"`
		ProductID uint `json:"product_id"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.UserID != callerID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "forbidden: cannot modify another user's resources",
		})
	}

	result := databases.DB.Where("user_id = ? AND product_id = ?", input.UserID, input.ProductID).Delete(&models.Favorite{})
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Favorite not found"})
	}
	return c.SendStatus(204)
}
