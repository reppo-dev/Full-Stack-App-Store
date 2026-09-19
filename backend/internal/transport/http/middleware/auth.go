package middleware

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/infrastructure/security"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

// Authenticate returns a Fiber middleware that validates session tokens from Cookies or Authorization headers.
func Authenticate(tokenManager security.TokenManager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenStr string

		// 1. Try Authorization header: Bearer <token>
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				tokenStr = parts[1]
			}
		}

		// 2. Fallback to Cookie "jwt"
		if tokenStr == "" {
			tokenStr = c.Cookies("jwt")
		}

		if tokenStr == "" {
			return response.Error(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "unauthenticated")
		}

		claims, err := tokenManager.ValidateToken(tokenStr)
		if err != nil || claims == nil || claims.UserID == 0 {
			return response.Error(c, fiber.StatusUnauthorized, "UNAUTHORIZED", "unauthenticated")
		}

		// Set context locals for downstream handlers
		c.Locals("userId", strconv.FormatInt(claims.UserID, 10))
		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("role", claims.Role)
		c.Locals("claims", claims)

		return c.Next()
	}
}

// RequireRole enforces that the authenticated user possesses one of the allowed role names.
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		var userRole string
		if roleVal != nil {
			if r, ok := roleVal.(string); ok {
				userRole = r
			}
		}

		// Check if userRole matches any allowed role
		allowed := false
		for _, r := range allowedRoles {
			if strings.EqualFold(userRole, r) {
				allowed = true
				break
			}
		}

		if !allowed {
			return response.Error(c, fiber.StatusForbidden, "FORBIDDEN", "forbidden: requires administrator privileges")
		}

		return c.Next()
	}
}
