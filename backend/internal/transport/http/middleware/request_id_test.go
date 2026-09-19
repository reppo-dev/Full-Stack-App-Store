package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func TestRequestID_GeneratesNewUUID(t *testing.T) {
	app := fiber.New()
	app.Use(RequestID())
	app.Get("/test", func(c *fiber.Ctx) error {
		reqID := GetRequestID(c)
		if reqID == "" {
			t.Errorf("expected GetRequestID to return non-empty ID")
		}
		if _, err := uuid.Parse(reqID); err != nil {
			t.Errorf("expected valid UUID v4, got: %s", reqID)
		}
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	headerID := resp.Header.Get(HeaderXRequestID)
	if headerID == "" {
		t.Errorf("expected response header %s to be set", HeaderXRequestID)
	}
	if _, err := uuid.Parse(headerID); err != nil {
		t.Errorf("expected response header to be valid UUID, got: %s", headerID)
	}
}

func TestRequestID_PreservesExistingHeader(t *testing.T) {
	app := fiber.New()
	app.Use(RequestID())
	app.Get("/test", func(c *fiber.Ctx) error {
		reqID := GetRequestID(c)
		if reqID != "incoming-trace-abc" {
			t.Errorf("expected preserved ID incoming-trace-abc, got: %s", reqID)
		}
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set(HeaderXRequestID, "incoming-trace-abc")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test failed: %v", err)
	}
	defer resp.Body.Close()

	headerID := resp.Header.Get(HeaderXRequestID)
	if headerID != "incoming-trace-abc" {
		t.Errorf("expected response header to match incoming-trace-abc, got: %s", headerID)
	}
}
