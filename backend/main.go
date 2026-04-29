package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/routes"
)

func main() {
	databases.Conect()
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowCredentials: true,
	}))

	routes.Setup(app)

	app.Listen(":8000")
}