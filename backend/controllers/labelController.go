package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

// POST /api/labels
func CreateLabel(c *fiber.Ctx) error {

	id , _ := strconv.Atoi(c.Params("id"))


    var input struct {
        Name      string `json:"name"`
        ColorCode string `json:"color_code"`
    }
    c.BodyParser(&input)


    label := models.Label{
        UserID:    uint(id),
        Name:      input.Name,
        ColorCode: input.ColorCode,
    }
    databases.DB.Create(&label)
    return c.Status(201).JSON(label)
}
