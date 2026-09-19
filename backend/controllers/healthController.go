package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// HealthLive reports process liveness with zero external dependencies.
// Used by orchestrators to determine if the container process is responsive.
func HealthLive(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":    "UP",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// HealthReady reports service readiness by pinging core infrastructure dependencies (PostgreSQL).
// Returns 200 when all critical dependencies are operational, or 503 if dependencies fail.
func HealthReady(c *fiber.Ctx) error {
	now := time.Now().UTC().Format(time.RFC3339)

	if databases.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":    "DOWN",
			"timestamp": now,
			"components": fiber.Map{
				"database": "DOWN",
			},
			"error": "database connection unreachable",
		})
	}

	sqlDB, err := databases.DB.DB()
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":    "DOWN",
			"timestamp": now,
			"components": fiber.Map{
				"database": "DOWN",
			},
			"error": "failed to access database handle",
		})
	}

	if err := sqlDB.Ping(); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":    "DOWN",
			"timestamp": now,
			"components": fiber.Map{
				"database": "DOWN",
			},
			"error": "database ping failed: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":    "READY",
		"timestamp": now,
		"components": fiber.Map{
			"database": "UP",
		},
	})
}

// HealthV1 reports API health using the standardized success response envelope.
func HealthV1(c *fiber.Ctx) error {
	now := time.Now().UTC().Format(time.RFC3339)
	dbStatus := "UP"

	if databases.DB == nil {
		dbStatus = "DOWN"
	} else if sqlDB, err := databases.DB.DB(); err != nil || sqlDB.Ping() != nil {
		dbStatus = "DOWN"
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"status":    "UP",
		"timestamp": now,
		"services": fiber.Map{
			"database": dbStatus,
		},
	})
}
