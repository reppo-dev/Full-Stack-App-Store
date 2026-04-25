package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func AllUser(c *fiber.Ctx) error {

	page,_ :=strconv.Atoi(c.Query("page","1")) 
}