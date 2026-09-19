package middleware

import (
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// InitLogger initializes and configures the global slog logger according to the environment.
// In production, it uses a high-performance JSON handler; in development, a human-readable text handler.
func InitLogger(env string) *slog.Logger {
	var handler slog.Handler
	opts := &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}

	if strings.EqualFold(env, "production") {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		opts.Level = slog.LevelDebug
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)
	slog.SetDefault(logger)
	return logger
}

// Logger returns a Fiber middleware that logs HTTP request metrics in structured format.
func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		latency := time.Since(start)
		latencyMs := float64(latency.Microseconds()) / 1000.0
		status := c.Response().StatusCode()
		reqID := GetRequestID(c)

		// Contextual log attributes
		attrs := []any{
			slog.String("request_id", reqID),
			slog.String("method", c.Method()),
			slog.String("path", c.Path()),
			slog.Int("status", status),
			slog.Float64("latency_ms", latencyMs),
			slog.String("ip", c.IP()),
		}

		if err != nil {
			attrs = append(attrs, slog.String("error", err.Error()))
		}

		msg := "HTTP Request"
		switch {
		case status >= 500:
			slog.Error(msg, attrs...)
		case status >= 400:
			slog.Warn(msg, attrs...)
		default:
			slog.Info(msg, attrs...)
		}

		return err
	}
}
