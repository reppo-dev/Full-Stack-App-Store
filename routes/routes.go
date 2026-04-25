package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/controllers"
)

func Setup(app *fiber.App) {
	app.Get("/api/users",controllers.AllUsers)
}