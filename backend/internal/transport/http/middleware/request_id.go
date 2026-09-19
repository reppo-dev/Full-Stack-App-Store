package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// HeaderXRequestID is the canonical HTTP header name for request correlation.
const HeaderXRequestID = "X-Request-ID"

// ContextKeyRequestID is the Fiber context key for storing the correlation ID.
const ContextKeyRequestID = "request_id"

// RequestID returns a Fiber middleware that ensures every HTTP request has a unique correlation ID.
// If an incoming request already carries an X-Request-ID header, it is preserved; otherwise, a new UUID v4 is generated.
func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		reqID := strings.TrimSpace(c.Get(HeaderXRequestID))
		if reqID == "" {
			reqID = uuid.New().String()
		}

		// Store in Fiber locals for downstream handlers, logging, and error tracking
		c.Locals(ContextKeyRequestID, reqID)

		// Set correlation ID in response header
		c.Set(HeaderXRequestID, reqID)

		return c.Next()
	}
}

// GetRequestID extracts the correlation ID from Fiber context or response header.
func GetRequestID(c *fiber.Ctx) string {
	if c == nil {
		return ""
	}
	if id, ok := c.Locals(ContextKeyRequestID).(string); ok && id != "" {
		return id
	}
	if id := c.Get(HeaderXRequestID); id != "" {
		return id
	}
	return ""
}
