package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllPermission(c *fiber.Ctx) error {
	var permission models.Permission

	databases.DB.Find(&permission)

	return c.JSON(permission)
}