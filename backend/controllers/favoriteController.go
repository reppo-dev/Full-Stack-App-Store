package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"gorm.io/gorm/clause"
)

func AllFavorite(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil || id <= 0 {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
    }

    var favorite []models.Favorite
    databases.DB.Where("user_id = ?", id).Preload("Product").Find(&favorite)

    return c.JSON(favorite)
}

func AddFavorite(c *fiber.Ctx) error {
    var input struct {
        UserID    uint `json:"user_id"`
        ProductID uint `json:"product_id"`
    }
    
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
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
    var input struct {
        UserID    uint `json:"user_id"`
        ProductID uint `json:"product_id"`
    }
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    result := databases.DB.Where("user_id = ? AND product_id = ?", input.UserID, input.ProductID).Delete(&models.Favorite{})
    if result.RowsAffected == 0 {
        return c.Status(404).JSON(fiber.Map{"error": "Favorite not found"})
    }
    return c.SendStatus(204)
}