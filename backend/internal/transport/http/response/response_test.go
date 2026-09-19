package response

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestNewSuccess(t *testing.T) {
	data := map[string]string{"message": "hello"}
	resp := NewSuccess(data)

	if !resp.Success {
		t.Errorf("expected resp.Success to be true")
	}
	if resp.Data["message"] != "hello" {
		t.Errorf("expected Data to match input")
	}
	if resp.Meta != nil {
		t.Errorf("expected Meta to be nil when not provided")
	}
}

func TestNewError(t *testing.T) {
	resp := NewError("NOT_FOUND", "Resource missing", "req-123", map[string]string{"id": "42"})

	if resp.Success {
		t.Errorf("expected resp.Success to be false")
	}
	if resp.Error.Code != "NOT_FOUND" {
		t.Errorf("expected code NOT_FOUND, got %s", resp.Error.Code)
	}
	if resp.Error.RequestID != "req-123" {
		t.Errorf("expected request_id req-123, got %s", resp.Error.RequestID)
	}
}

func TestFiberResponse_Success(t *testing.T) {
	app := fiber.New()
	app.Get("/test-success", func(c *fiber.Ctx) error {
		return Success(c, fiber.StatusOK, map[string]string{"status": "ok"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test-success", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var result SuccessResponse[map[string]string]
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("failed to unmarshal JSON: %v", err)
	}

	if !result.Success {
		t.Errorf("expected success true")
	}
	if result.Data["status"] != "ok" {
		t.Errorf("expected data.status to be 'ok'")
	}
}

func TestFiberResponse_Error(t *testing.T) {
	app := fiber.New()
	app.Get("/test-error", func(c *fiber.Ctx) error {
		c.Locals("request_id", "trace-abc-123")
		return BadRequest(c, "INVALID_INPUT", "Malformed email")
	})

	req := httptest.NewRequest(http.MethodGet, "/test-error", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var errResult ErrorResponse
	if err := json.Unmarshal(body, &errResult); err != nil {
		t.Fatalf("failed to unmarshal JSON: %v", err)
	}

	if errResult.Success {
		t.Errorf("expected success false")
	}
	if errResult.Error.Code != "INVALID_INPUT" {
		t.Errorf("expected code INVALID_INPUT, got %s", errResult.Error.Code)
	}
	if errResult.Error.RequestID != "trace-abc-123" {
		t.Errorf("expected request_id trace-abc-123, got %s", errResult.Error.RequestID)
	}
}
