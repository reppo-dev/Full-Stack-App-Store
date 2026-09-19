package routes_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/middlewares"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/routes"
	"github.com/reppo/go-backend/util"
)

func setupTestApp() *fiber.App {
	app := fiber.New()
	routes.Setup(app)

	// Configure mock UserFinder for in-memory testing
	middlewares.UserFinder = func(userId int) (*models.User, error) {
		switch userId {
		case 2: // Admin user
			user := &models.User{RoleID: 2, Role: models.Role{Name: "admin"}}
			user.ID = 2
			return user, nil
		case 1, 5: // Regular users
			user := &models.User{RoleID: 1, Role: models.Role{Name: "customer"}}
			user.ID = uint(userId)
			return user, nil
		default:
			return nil, fiber.ErrNotFound
		}
	}

	return app
}

func TestUnauthenticatedPerimeterProtection(t *testing.T) {
	app := setupTestApp()

	protectedEndpoints := []struct {
		name   string
		method string
		target string
	}{
		{"DeleteUser", "DELETE", "/api/users/1"},
		{"CreateUser", "POST", "/api/users"},
		{"AllUsers", "GET", "/api/users"},
		{"DeleteProduct", "DELETE", "/api/products/1"},
		{"CreateProduct", "POST", "/api/products"},
		{"Upload", "POST", "/uploads"},
		{"Roles", "GET", "/api/roles"},
		{"Orders", "GET", "/api/orders"},
		{"UserProfile", "GET", "/api/user"},
		{"AllFavorite", "GET", "/api/favorites/1"},
		{"AddFavorite", "POST", "/api/favorites"},
		{"RemoveFavorite", "DELETE", "/api/favorites"},
	}

	for _, tc := range protectedEndpoints {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.target, nil)
			req.Header.Set("Content-Type", "application/json")

			resp, err := app.Test(req, -1)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if resp.StatusCode != http.StatusUnauthorized {
				t.Errorf("expected status 401 for %s %s, got %d", tc.method, tc.target, resp.StatusCode)
			}

			body, _ := io.ReadAll(resp.Body)
			var respData map[string]interface{}
			if err := json.Unmarshal(body, &respData); err != nil {
				t.Fatalf("failed to parse JSON response: %v", err)
			}

			if respData["message"] != "unauthenticated" {
				t.Errorf("expected message 'unauthenticated', got '%v'", respData["message"])
			}
		})
	}
}

func TestNonAdminAuthorizationProtection(t *testing.T) {
	app := setupTestApp()

	// Generate JWT for regular customer (user ID 1)
	token, err := util.GenerateJwt(1)
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	adminOnlyEndpoints := []struct {
		name   string
		method string
		target string
	}{
		{"DeleteUser", "DELETE", "/api/users/1"},
		{"CreateUser", "POST", "/api/users"},
		{"AllUsers", "GET", "/api/users"},
		{"DeleteProduct", "DELETE", "/api/products/1"},
		{"CreateProduct", "POST", "/api/products"},
		{"Upload", "POST", "/uploads"},
		{"Roles", "GET", "/api/roles"},
		{"Orders", "GET", "/api/orders"},
	}

	for _, tc := range adminOnlyEndpoints {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.target, nil)
			req.Header.Set("Cookie", "jwt="+token)

			resp, err := app.Test(req, -1)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if resp.StatusCode != http.StatusForbidden {
				t.Errorf("expected status 403 for non-admin on %s %s, got %d", tc.method, tc.target, resp.StatusCode)
			}

			body, _ := io.ReadAll(resp.Body)
			var respData map[string]interface{}
			if err := json.Unmarshal(body, &respData); err != nil {
				t.Fatalf("failed to parse JSON response: %v", err)
			}

			if respData["message"] != "forbidden: requires administrator privileges" {
				t.Errorf("expected message 'forbidden: requires administrator privileges', got '%v'", respData["message"])
			}
		})
	}
}

func TestFavoriteIDORProtection(t *testing.T) {
	app := setupTestApp()

	// Authenticated as user 5
	token, err := util.GenerateJwt(5)
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	// 1. Attempt to delete user 2's favorite as user 5
	t.Run("DeleteFavoriteOtherUser", func(t *testing.T) {
		payload := []byte(`{"user_id": 2, "product_id": 10}`)
		req := httptest.NewRequest("DELETE", "/api/favorites", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Cookie", "jwt="+token)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403 on IDOR delete, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var respData map[string]interface{}
		json.Unmarshal(body, &respData)
		if respData["message"] != "forbidden: cannot modify another user's resources" {
			t.Errorf("expected IDOR message, got '%v'", respData["message"])
		}
	})

	// 2. Attempt to add favorite for user 2 as user 5
	t.Run("AddFavoriteOtherUser", func(t *testing.T) {
		payload := []byte(`{"user_id": 2, "product_id": 10}`)
		req := httptest.NewRequest("POST", "/api/favorites", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Cookie", "jwt="+token)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403 on IDOR add, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var respData map[string]interface{}
		json.Unmarshal(body, &respData)
		if respData["message"] != "forbidden: cannot modify another user's resources" {
			t.Errorf("expected IDOR message, got '%v'", respData["message"])
		}
	})

	// 3. Attempt to view user 2's favorites as user 5
	t.Run("GetFavoriteOtherUser", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/favorites/2", nil)
		req.Header.Set("Cookie", "jwt="+token)

		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403 on IDOR get, got %d", resp.StatusCode)
		}

		body, _ := io.ReadAll(resp.Body)
		var respData map[string]interface{}
		json.Unmarshal(body, &respData)
		if respData["message"] != "forbidden: cannot modify another user's resources" {
			t.Errorf("expected IDOR message, got '%v'", respData["message"])
		}
	})
}

func TestPublicCatalogRoutesNotBlocked(t *testing.T) {
	app := setupTestApp()

	// Anonymous request to /api/products should not be blocked with 401 or 403
	req := httptest.NewRequest("GET", "/api/products", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		t.Errorf("public endpoint /api/products should NOT return 401 or 403, got %d", resp.StatusCode)
	}
}

func TestHealthLiveEndpoint(t *testing.T) {
	app := setupTestApp()

	req := httptest.NewRequest("GET", "/health/live", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200 for /health/live, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var respData map[string]interface{}
	if err := json.Unmarshal(body, &respData); err != nil {
		t.Fatalf("failed to parse JSON from /health/live: %v", err)
	}

	if respData["status"] != "UP" {
		t.Errorf("expected status 'UP', got '%v'", respData["status"])
	}
}

func TestHealthReadyEndpoint(t *testing.T) {
	app := setupTestApp()

	// When database is not initialized (DB is nil in test environment)
	req := httptest.NewRequest("GET", "/health/ready", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Without active DB connection, readiness should return 503 Service Unavailable
	if resp.StatusCode != http.StatusServiceUnavailable && resp.StatusCode != http.StatusOK {
		t.Errorf("expected 503 (or 200 if DB connected) for /health/ready, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var respData map[string]interface{}
	if err := json.Unmarshal(body, &respData); err != nil {
		t.Fatalf("failed to parse JSON from /health/ready: %v", err)
	}

	if resp.StatusCode == http.StatusServiceUnavailable {
		if respData["status"] != "DOWN" {
			t.Errorf("expected status 'DOWN' on 503, got '%v'", respData["status"])
		}
	} else if resp.StatusCode == http.StatusOK {
		if respData["status"] != "READY" {
			t.Errorf("expected status 'READY' on 200, got '%v'", respData["status"])
		}
	}
}

func TestHealthV1Endpoint(t *testing.T) {
	app := setupTestApp()

	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200 for /api/v1/health, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var respData map[string]interface{}
	if err := json.Unmarshal(body, &respData); err != nil {
		t.Fatalf("failed to parse JSON from /api/v1/health: %v", err)
	}

	if respData["success"] != true {
		t.Errorf("expected success true, got %v", respData["success"])
	}
	data, ok := respData["data"].(map[string]interface{})
	if !ok || data["status"] != "UP" {
		t.Errorf("expected data.status 'UP', got %v", data)
	}
}
