package middleware

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/internal/transport/http/response"
)

func TestRecover_CatchesPanicAndSanitizesResponse(t *testing.T) {
	app := fiber.New()
	app.Use(RequestID())
	app.Use(Recover())

	app.Get("/panic-test", func(c *fiber.Ctx) error {
		panic("critical database nil pointer dereference at runtime/db.go:42")
	})

	req := httptest.NewRequest(http.MethodGet, "/panic-test", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("expected status 500, got: %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	bodyStr := string(body)

	// Check that internal stack trace details are NOT leaked
	if strings.Contains(bodyStr, "db.go:42") || strings.Contains(bodyStr, "nil pointer") {
		t.Errorf("stack trace leaked to client: %s", bodyStr)
	}

	var errResp response.ErrorResponse
	if err := json.Unmarshal(body, &errResp); err != nil {
		t.Fatalf("failed to parse JSON error response: %v", err)
	}

	if errResp.Success {
		t.Errorf("expected success to be false")
	}
	if errResp.Error.Code != "INTERNAL_SERVER_ERROR" {
		t.Errorf("expected error code INTERNAL_SERVER_ERROR, got: %s", errResp.Error.Code)
	}
	if errResp.Error.RequestID == "" {
		t.Errorf("expected request_id in error response to be non-empty")
	}
}
