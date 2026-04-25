package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllUsers(c *fiber.Ctx) error {


	page, _ := strconv.Atoi(c.Query("page", "1"))

	return c.JSON(models.Paginate(databases.DB,&models.User{},page))
}

func GetUser(c *fiber.Ctx) error {
	
}