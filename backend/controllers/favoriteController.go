package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllFavorite(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	var favorite []models.Favorite

	databases.DB.Where("user_id = ?",id).Preload("Product").Find(&favorite)

	return c.JSON(favorite)
}




func AddFavorit(c *fiber.Ctx) error {
	var input struct {
    UserID    uint `json:"user_id"`
    ProductID uint `json:"product_id"`
	}
	c.BodyParser(&input)

	var existing models.Favorite

	databases.DB.Where("user_id = ? AND product_id = ?",input.UserID,input.ProductID).First(&existing)

	fav := models.Favorite{
		UserID: input.UserID,
		ProductID: input.ProductID,
	}

	databases.DB.Create(&fav)

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