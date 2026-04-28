package middlewares

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util"
	"gorm.io/gorm"
)

func IsAuthorized(c *fiber.Ctx, page string) error {
	cookie := c.Cookies("jwt")
	Id, err := util.ParseJwt(cookie)
	if err != nil {
		return err
	}

	userId, _ := strconv.Atoi(Id)

	user := models.User{
		Model: gorm.Model{ID: uint(userId)},
	}

	databases.DB.Preload("Role").Find(&user)
	role := user.Role.Name

	if role == "admin" {
		return nil
	}

	if role == "user" {
		if c.Method() == "GET" {
			return nil
		}
	}

	c.Status(fiber.StatusUnauthorized)
	return errors.New("unauthorized")
}