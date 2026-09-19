package middleware

import (
	"fmt"
	"log/slog"
	"runtime/debug"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// Recover returns a Fiber middleware that recovers from unhandled panics,
// logs the stack trace privately with correlation context, and returns a sanitized HTTP 500 error envelope.
func Recover() fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		defer func() {
			if r := recover(); r != nil {
				reqID := GetRequestID(c)
				stackTrace := string(debug.Stack())

				// Structured private log containing the actual panic and stack trace
				slog.Error("Unhandled panic recovered in HTTP handler",
					slog.String("request_id", reqID),
					slog.String("method", c.Method()),
					slog.String("path", c.Path()),
					slog.Any("panic", fmt.Sprintf("%v", r)),
					slog.String("stack", stackTrace),
				)

				// Return sanitized JSON response without leaking internal paths or stack
				err = response.InternalServerError(c, "An unexpected internal server error occurred")
			}
		}()

		return c.Next()
	}
}
