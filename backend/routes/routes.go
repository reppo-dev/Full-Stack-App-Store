package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/controllers"
)

func Setup(app *fiber.App) {

	app.Post("/api/register", controllers.Register)
	app.Post("/api/login", controllers.Login)


	app.Get("/api/user", controllers.User)
	app.Put("/api/updateinfo", controllers.UpdateInfo)
	app.Put("/api/updatepassword", controllers.UpdatePassword)
	app.Post("/api/logout", controllers.Logout)

	app.Get("/api/users", controllers.AllUsers)
	app.Post("/api/users", controllers.CreateUser)
	app.Get("/api/users/:id", controllers.GetUser)
	app.Put("/api/users/:id", controllers.UpdateUser)
	app.Delete("/api/users/:id", controllers.DeleteUser)

	app.Get("/api/roles", controllers.AllRole)
	app.Post("/api/roles", controllers.CreateRole)
	app.Get("/api/roles/:id", controllers.GetRole)
	app.Put("/api/roles/:id", controllers.UpdateRole)
	app.Delete("/api/roles/:id", controllers.DeleteRole)

	app.Get("/api/products", controllers.AllProduct)
	app.Get("/api/productss",controllers.AllProducts)
	app.Post("/api/products", controllers.CreateProduct)
	app.Get("/api/products/:id", controllers.GetProduct)
	app.Put("/api/products/:id", controllers.UpdateProduct)
	app.Delete("/api/products/:id", controllers.DeleteProduct)

	app.Get("/api/orders", controllers.AllOrder)
	app.Get("/api/orders/export", controllers.Export)
	app.Get("/api/orders/chart", controllers.Chart)

	app.Get("/api/favorites/:id", controllers.AllFavorite)
	app.Delete("/api/favorites", controllers.RemoveFavorite)
	app.Post("/api/favorites",controllers.AddFavorite)




	app.Post("/api/labels", controllers.CreateLabel)

	app.Get("/api/labels/:id", controllers.AllLabelUser)

	app.Get("/api/labels/:id/messages", controllers.GetMessagesByLabel)
	app.Get("/api/messages/:id", controllers.GetMessage)
	app.Post("/api/messages/:id/labels", controllers.AddLabelToMessage)
	app.Delete("/api/messages/:msgID/labels/:labelID", controllers.RemoveLabelFromMessage)


	app.Post("/api/messages", controllers.CreateMessage)
	app.Get("/api/messages", controllers.GetMessages)
	app.Get("/api/messages/:id", controllers.GetMessage)
	app.Put("/api/messages/:id/star", controllers.ToggleStar)
	app.Put("/api/messages/:id/important", controllers.ToggleImportant)
	app.Put("/api/messages/:id/trash", controllers.MoveToTrash)
	app.Put("/api/messages/:id/restore", controllers.RestoreMessage)
	app.Delete("/api/messages/:id", controllers.DeleteMessage)

	app.Post("/api/messages/:id/labels", controllers.AddLabelToMessage)
	app.Delete("/api/messages/:id/labels/:labelID", controllers.RemoveLabelFromMessage)
	app.Get("/api/labels/:id/messages", controllers.GetMessagesByLabel)
}