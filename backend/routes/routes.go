package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/controllers"
	"github.com/reppo/go-backend/middlewares"
)

func Setup(app *fiber.App) {



api := app.Group("/api", middlewares.IsAuthenticated)

api.Get("/user", controllers.User)
api.Put("/updateinfo", controllers.UpdateInfo)
api.Put("/updatepassword", controllers.UpdatePassword)
api.Post("/logout", controllers.Logout)
app.Post("/api/register", controllers.Register)
app.Post("/api/login", controllers.Login)



api.Get("/users", controllers.AllUsers)
api.Post("/users", controllers.CreateUser)
api.Get("/users/:id", controllers.GetUser)
api.Put("/users/:id", controllers.UpdateUser)
api.Delete("/users/:id", controllers.DeleteUser)


api.Get("/roles", controllers.AllRole)
api.Post("/roles", controllers.CreateRole)
api.Get("/roles/:id", controllers.GetRole)
api.Put("/roles/:id", controllers.UpdateRole)
api.Delete("/roles/:id", controllers.DeleteRole)


app.Get("/api/products", controllers.AllProduct)
api.Post("/products", controllers.CreateProduct)
app.Get("/api/products/:id", controllers.GetProduct)
api.Put("/products/:id", controllers.UpdateProduct)
api.Delete("/products/:id", controllers.DeleteProduct)


api.Get("/orders", controllers.AllOrder)
api.Get("/orders/export", controllers.Export)
api.Get("/orders/chart", controllers.Chart)
}