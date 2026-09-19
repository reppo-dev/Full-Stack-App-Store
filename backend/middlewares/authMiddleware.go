package middlewares

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util"
)

// UserFinder resolves a user by ID. Can be overridden in tests to avoid external DB dependency.
var UserFinder = func(userId int) (*models.User, error) {
	if databases.DB == nil {
		return nil, errors.New("database not initialized")
	}
	var user models.User
	err := databases.DB.Preload("Role").First(&user, userId).Error
	return &user, err
}

func IsAuthenticated(c *fiber.Ctx) error {
	tokenStr := c.Cookies("jwt")
	if tokenStr == "" {
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				tokenStr = parts[1]
			}
		}
	}

	id, err := util.ParseJwt(tokenStr)
	if err != nil || id == "" {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"message": "unauthenticated",
		})
	}

	c.Locals("userId", id)
	return c.Next()
}

func RequireAdmin(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")
	if userIdVal == nil {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"message": "unauthenticated",
		})
	}

	userIdStr, ok := userIdVal.(string)
	if !ok || userIdStr == "" {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"message": "unauthenticated",
		})
	}

	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{
			"message": "unauthenticated",
		})
	}

	user, err := UserFinder(userId)
	if err != nil || user == nil {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"message": "forbidden: requires administrator privileges",
		})
	}

	if user.RoleID != 2 && user.Role.Name != "admin" {
		c.Status(fiber.StatusForbidden)
		return c.JSON(fiber.Map{
			"message": "forbidden: requires administrator privileges",
		})
	}

	return c.Next()
}
