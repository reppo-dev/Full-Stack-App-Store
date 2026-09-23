package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/controllers"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"github.com/reppo/go-backend/internal/transport/http/handler"
	"github.com/reppo/go-backend/internal/transport/http/middleware"
)

// RouteDependencies holds injectable HTTP handlers and security managers for V1 API routes.
type RouteDependencies struct {
	AuthHandler     *handler.AuthHandler
	UserHandler     *handler.UserHandler
	RoleHandler     *handler.RoleHandler
	CategoryHandler *handler.CategoryHandler
	ProductHandler  *handler.ProductHandler
	OrderHandler    *handler.OrderHandler
	FavoriteHandler *handler.FavoriteHandler
	TicketHandler   *handler.TicketHandler
	DashboardHandler *handler.DashboardHandler
	BannerHandler    *handler.BannerHandler
	DynamicUIHandler *handler.DynamicUIHandler
	CalendarHandler  *handler.CalendarHandler
	TokenManager     security.TokenManager
}

// Setup registers both legacy API endpoints and modular V1 API endpoints into the Fiber application.
func Setup(app *fiber.App, optDeps ...*RouteDependencies) {
	var deps *RouteDependencies
	if len(optDeps) > 0 {
		deps = optDeps[0]
	}

	// =========================================================================
	// 1. Operational & Health Probes (Public)
	// =========================================================================
	app.Get("/health/live", controllers.HealthLive)
	app.Get("/health/ready", controllers.HealthReady)

	// API v1 root group
	v1 := app.Group("/api/v1")
	v1.Get("/health", controllers.HealthV1)

	// =========================================================================
	// 2. V1 Modular Identity, Catalog, Commerce & User Endpoints (Strangler Architecture)
	// =========================================================================
	if deps != nil {
		var authGuard fiber.Handler
		var adminGuard fiber.Handler
		if deps.TokenManager != nil {
			authGuard = middleware.Authenticate(deps.TokenManager)
			adminGuard = middleware.RequireRole("admin")
		}

		if deps.AuthHandler != nil && authGuard != nil {
			authGroup := v1.Group("/auth")
			authGroup.Post("/register", deps.AuthHandler.Register)
			authGroup.Post("/login", deps.AuthHandler.Login)
			authGroup.Post("/logout", authGuard, deps.AuthHandler.Logout)
			authGroup.Get("/me", authGuard, deps.AuthHandler.Me)
			authGroup.Put("/password", authGuard, deps.AuthHandler.UpdatePassword)
		}

		if deps.UserHandler != nil && authGuard != nil && adminGuard != nil {
			userGroup := v1.Group("/users")
			userGroup.Get("/", authGuard, adminGuard, deps.UserHandler.ListPaginated)
			userGroup.Get("/all", authGuard, adminGuard, deps.UserHandler.ListAll)
			userGroup.Post("/", authGuard, adminGuard, deps.UserHandler.CreateUser)
			userGroup.Put("/profile", authGuard, deps.UserHandler.UpdateProfile)
			userGroup.Get("/:id", authGuard, adminGuard, deps.UserHandler.GetUser)
			userGroup.Put("/:id", authGuard, adminGuard, deps.UserHandler.UpdateUser)
			userGroup.Delete("/:id", authGuard, adminGuard, deps.UserHandler.DeleteUser)
		}

		if deps.RoleHandler != nil && authGuard != nil && adminGuard != nil {
			roleGroup := v1.Group("/roles")
			roleGroup.Get("/", authGuard, adminGuard, deps.RoleHandler.ListRoles)
			roleGroup.Post("/", authGuard, adminGuard, deps.RoleHandler.CreateRole)
			roleGroup.Get("/:id", authGuard, adminGuard, deps.RoleHandler.GetRole)
			roleGroup.Put("/:id", authGuard, adminGuard, deps.RoleHandler.UpdateRole)
			roleGroup.Delete("/:id", authGuard, adminGuard, deps.RoleHandler.DeleteRole)

			v1.Get("/permissions", authGuard, adminGuard, deps.RoleHandler.ListPermissions)
		}

		if deps.CategoryHandler != nil {
			catGroup := v1.Group("/categories")
			catGroup.Get("/", deps.CategoryHandler.ListCategories)
			catGroup.Get("/tree", deps.CategoryHandler.GetTree)
			catGroup.Get("/slug/:slug", deps.CategoryHandler.GetCategoryBySlug)
			catGroup.Get("/:id", deps.CategoryHandler.GetCategory)

			if authGuard != nil && adminGuard != nil {
				catGroup.Post("/", authGuard, adminGuard, deps.CategoryHandler.CreateCategory)
				catGroup.Put("/:id", authGuard, adminGuard, deps.CategoryHandler.UpdateCategory)
				catGroup.Delete("/:id", authGuard, adminGuard, deps.CategoryHandler.DeleteCategory)
			}
		}

		if deps.ProductHandler != nil {
			prodGroup := v1.Group("/products")
			prodGroup.Get("/", deps.ProductHandler.ListProducts)
			prodGroup.Get("/slug/:slug", deps.ProductHandler.GetProductBySlug)
			prodGroup.Get("/:id", deps.ProductHandler.GetProduct)

			if authGuard != nil && adminGuard != nil {
				prodGroup.Post("/", authGuard, adminGuard, deps.ProductHandler.CreateProduct)
				prodGroup.Put("/:id", authGuard, adminGuard, deps.ProductHandler.UpdateProduct)
				prodGroup.Delete("/:id", authGuard, adminGuard, deps.ProductHandler.DeleteProduct)
			}
		}

		if deps.OrderHandler != nil && authGuard != nil {
			orderGroup := v1.Group("/orders")
			orderGroup.Post("/", authGuard, deps.OrderHandler.CreateOrder)
			orderGroup.Get("/my", authGuard, deps.OrderHandler.GetMyOrders)

			if adminGuard != nil {
				orderGroup.Get("/export", authGuard, adminGuard, deps.OrderHandler.ExportCSV)
				orderGroup.Get("/chart", authGuard, adminGuard, deps.OrderHandler.GetChart)
				orderGroup.Get("/", authGuard, adminGuard, deps.OrderHandler.ListAllOrders)
				orderGroup.Put("/:id/status", authGuard, adminGuard, deps.OrderHandler.UpdateStatus)
			}

			orderGroup.Get("/:id", authGuard, deps.OrderHandler.GetOrder)
		}

		if deps.FavoriteHandler != nil && authGuard != nil {
			favGroup := v1.Group("/favorites")
			favGroup.Get("/", authGuard, deps.FavoriteHandler.ListFavorites)
			favGroup.Post("/", authGuard, deps.FavoriteHandler.AddFavorite)
			favGroup.Get("/check/:product_id", authGuard, deps.FavoriteHandler.CheckFavorite)
			favGroup.Get("/:product_id/check", authGuard, deps.FavoriteHandler.CheckFavorite)
			favGroup.Delete("/:product_id", authGuard, deps.FavoriteHandler.RemoveFavorite)
		}

		if deps.TicketHandler != nil && authGuard != nil {
			ticketGroup := v1.Group("/tickets")
			ticketGroup.Post("/", authGuard, deps.TicketHandler.CreateTicket)
			ticketGroup.Get("/", authGuard, deps.TicketHandler.GetTickets)
			ticketGroup.Get("/:id", authGuard, deps.TicketHandler.GetTicketByID)
			ticketGroup.Post("/:id/messages", authGuard, deps.TicketHandler.AddMessage)
			ticketGroup.Put("/:id/status", authGuard, deps.TicketHandler.UpdateStatus)
			if adminGuard != nil {
				ticketGroup.Put("/:id/assign", authGuard, adminGuard, deps.TicketHandler.AssignTicket)
			}
		}

		if deps.DashboardHandler != nil {
			dashGroup := v1.Group("/dashboard")
			if authGuard != nil && adminGuard != nil {
				dashGroup.Get("/metrics", authGuard, adminGuard, deps.DashboardHandler.GetMetrics)
			} else {
				dashGroup.Get("/metrics", deps.DashboardHandler.GetMetrics)
			}
		}

		if deps.BannerHandler != nil {
			bannerGroup := v1.Group("/banners")
			bannerGroup.Get("/", deps.BannerHandler.ListActiveBanners)

			if authGuard != nil && adminGuard != nil {
				adminBannerGroup := bannerGroup.Group("/admin", authGuard, adminGuard)
				adminBannerGroup.Get("/", deps.BannerHandler.ListAllBanners)
				adminBannerGroup.Post("/", deps.BannerHandler.CreateBanner)
				adminBannerGroup.Put("/:id", deps.BannerHandler.UpdateBanner)
				adminBannerGroup.Delete("/:id", deps.BannerHandler.DeleteBanner)
			}
			
			// Must be registered after /admin to not intercept it
			bannerGroup.Get("/:id", deps.BannerHandler.GetBannerByID)
		}

		if deps.DynamicUIHandler != nil {
			uiGroup := v1.Group("/ui")
			uiGroup.Get("/brands", deps.DynamicUIHandler.GetBrands)
			uiGroup.Get("/stories", deps.DynamicUIHandler.GetStories)
		}

		if deps.CalendarHandler != nil {
			calGroup := v1.Group("/calendar")
			calGroup.Get("/", deps.CalendarHandler.ListEvents)
			calGroup.Get("/:id", deps.CalendarHandler.GetEvent)

			if authGuard != nil && adminGuard != nil {
				calGroup.Post("/", authGuard, adminGuard, deps.CalendarHandler.CreateEvent)
				calGroup.Put("/:id", authGuard, adminGuard, deps.CalendarHandler.UpdateEvent)
				calGroup.Delete("/:id", authGuard, adminGuard, deps.CalendarHandler.DeleteEvent)
			}
		}
	}

}
