package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/internal/application/service"
	"github.com/reppo/go-backend/internal/config"
	"github.com/reppo/go-backend/internal/infrastructure/cache"
	"github.com/reppo/go-backend/internal/infrastructure/database"
	"github.com/reppo/go-backend/internal/infrastructure/database/repository"
	"github.com/reppo/go-backend/internal/infrastructure/database/sqlc"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"github.com/reppo/go-backend/internal/transport/http/handler"
	"github.com/reppo/go-backend/internal/transport/http/middleware"
	"github.com/reppo/go-backend/routes"
)

func main() {
	_ = godotenv.Load()

	// 1. 12-Factor Configuration Validation (Constitution Principle XXXVI)
	cfg, err := config.LoadConfig()
	if err != nil {
		slog.Error("Configuration validation failed at bootstrap", slog.String("error", err.Error()))
		os.Exit(1)
	}

	// 2. Structured Observability Engine (Constitution Principle XXXIII)
	logger := middleware.InitLogger(cfg.Env)
	logger.Info("Bootstrapping DashStack backend service",
		slog.String("env", cfg.Env),
		slog.String("port", cfg.Port),
	)

	// 3. Infrastructure Connections (Constitution Principles I & XXVIII)
	databases.Conect()
	databases.InitRedis()

	// 3b. PostgreSQL pgxpool & SQLC Repositories (Phase 3 Modern Architecture)
	var pgxPool *database.PostgresPool
	var routeDeps *routes.RouteDependencies

	pool, err := database.NewPostgresPool(context.Background(), cfg.GetDSN())
	if err != nil {
		logger.Warn("Failed to initialize dedicated pgxpool; operating with GORM compatibility mode", slog.String("error", err.Error()))
	} else {
		pgxPool = pool
		querier := sqlc.New(pool.Pool)
		userRepo := repository.NewUserRepositorySQLC(querier)
		roleRepo := repository.NewRoleRepositorySQLC(querier)
		hasher := security.NewBcryptHasher(security.BcryptCost12)
		tokenManager := security.NewJWTTokenManager(cfg.JWTSecret, 24*time.Hour)

		authSvc := service.NewAuthService(userRepo, hasher, tokenManager)
		userSvc := service.NewUserService(userRepo, hasher)
		roleSvc := service.NewRoleService(roleRepo)

		rdb := redis.NewClient(&redis.Options{
			Addr: cfg.RedisURL,
		})
		redisCache := cache.NewRedisCache(rdb)

		categoryRepo := repository.NewCategoryRepositorySQLC(querier, redisCache)
		productRepo := repository.NewProductRepositorySQLC(querier, redisCache)

		categorySvc := service.NewCategoryService(categoryRepo)
		productSvc := service.NewProductService(productRepo)

		orderRepo := repository.NewOrderRepositorySQLC(querier, pool.Pool)
		favoriteRepo := repository.NewFavoriteRepositorySQLC(querier)
		ticketRepo := repository.NewTicketRepositorySQLC(querier)
		dashboardRepo := repository.NewDashboardRepositorySQLC(querier)

		orderSvc := service.NewOrderService(orderRepo)
		favoriteSvc := service.NewFavoriteService(favoriteRepo)
		ticketSvc := service.NewTicketService(ticketRepo)
		dashboardSvc := service.NewDashboardService(dashboardRepo)

		routeDeps = &routes.RouteDependencies{
			AuthHandler:      handler.NewAuthHandler(authSvc),
			UserHandler:      handler.NewUserHandler(userSvc),
			RoleHandler:      handler.NewRoleHandler(roleSvc),
			CategoryHandler:  handler.NewCategoryHandler(categorySvc),
			ProductHandler:   handler.NewProductHandler(productSvc),
			OrderHandler:     handler.NewOrderHandler(orderSvc),
			FavoriteHandler:  handler.NewFavoriteHandler(favoriteSvc),
			TicketHandler:    handler.NewTicketHandler(ticketSvc),
			DashboardHandler: handler.NewDashboardHandler(dashboardSvc),
			TokenManager:     tokenManager,
		}
		logger.Info("SQLC repositories and Application services initialized cleanly")
	}

	// 4. Fiber Engine Initialization & Global Middlewares
	app := fiber.New(fiber.Config{
		DisableStartupMessage: cfg.IsProduction(),
	})

	// Order of middleware: RequestID -> Logger -> Panic Recovery -> CORS
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())
	app.Use(middleware.Recover())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.ClientURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Cookie, Authorization, X-Request-ID",
		ExposeHeaders:    "X-Request-ID",
	}))

	// 5. Route Registration
	routes.Setup(app, routeDeps)

	// 6. Asynchronous HTTP Server Start
	serverErrChan := make(chan error, 1)
	go func() {
		logger.Info("HTTP server listening", slog.String("addr", ":"+cfg.Port))
		if err := app.Listen(":" + cfg.Port); err != nil && err != http.ErrServerClosed {
			serverErrChan <- err
		}
	}()

	// 7. OS Signal Trapping & Graceful Shutdown (Constitution Principle XXX)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrChan:
		logger.Error("Fatal HTTP server listening failure", slog.String("error", err.Error()))
		os.Exit(1)
	case sig := <-quit:
		logger.Info("OS signal intercepted; commencing graceful shutdown",
			slog.String("signal", sig.String()),
		)
	}

	// 8. Drain in-flight HTTP requests within 10 seconds
	if err := app.ShutdownWithTimeout(10 * time.Second); err != nil {
		logger.Error("Error during HTTP server shutdown drain", slog.String("error", err.Error()))
	} else {
		logger.Info("HTTP server connection draining finished cleanly")
	}

	// 9. Close Database & Infrastructure Connections
	if pgxPool != nil {
		pgxPool.Close()
		logger.Info("pgxpool connection pool closed")
	}

	if err := databases.CloseDB(); err != nil {
		logger.Error("Error closing PostgreSQL connection pool", slog.String("error", err.Error()))
	} else {
		logger.Info("PostgreSQL connection pool closed")
	}

	_ = databases.CloseRedis()
	logger.Info("DashStack backend terminated cleanly with exit code 0")
}
