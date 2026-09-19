package response

import (
	"github.com/gofiber/fiber/v2"
)

// SuccessResponse defines the standard envelope for successful API responses.
type SuccessResponse[T any] struct {
	Success bool `json:"success"`
	Data    T    `json:"data"`
	Meta    any  `json:"meta,omitempty"`
}

// ErrorResponse defines the standard envelope for API error responses.
type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   ErrorDetail `json:"error"`
}

// ErrorDetail contains structured diagnostics for an API error.
type ErrorDetail struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"request_id,omitempty"`
	Details   any    `json:"details,omitempty"`
}

// NewSuccess creates an in-memory SuccessResponse.
func NewSuccess[T any](data T, meta ...any) SuccessResponse[T] {
	resp := SuccessResponse[T]{
		Success: true,
		Data:    data,
	}
	if len(meta) > 0 && meta[0] != nil {
		resp.Meta = meta[0]
	}
	return resp
}

// NewError creates an in-memory ErrorResponse.
func NewError(code, message, requestID string, details ...any) ErrorResponse {
	detail := ErrorDetail{
		Code:      code,
		Message:   message,
		RequestID: requestID,
	}
	if len(details) > 0 && details[0] != nil {
		detail.Details = details[0]
	}
	return ErrorResponse{
		Success: false,
		Error:   detail,
	}
}

// Success writes a 2xx success envelope to the Fiber context.
func Success(c *fiber.Ctx, statusCode int, data any) error {
	return c.Status(statusCode).JSON(NewSuccess(data))
}

// SuccessWithMeta writes a success envelope with pagination/meta information.
func SuccessWithMeta(c *fiber.Ctx, statusCode int, data any, meta any) error {
	return c.Status(statusCode).JSON(NewSuccess(data, meta))
}

// Created writes an HTTP 201 Created success response.
func Created(c *fiber.Ctx, data any) error {
	return Success(c, fiber.StatusCreated, data)
}

// NoContent sends an HTTP 204 No Content response with an empty body.
func NoContent(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNoContent)
}

// Error writes a structured error envelope to the Fiber context.
// Automatically pulls request_id from c.Locals if available.
func Error(c *fiber.Ctx, statusCode int, code string, message string, details ...any) error {
	reqID := getRequestID(c)
	var detailPayload any
	if len(details) > 0 {
		detailPayload = details[0]
	}
	return c.Status(statusCode).JSON(NewError(code, message, reqID, detailPayload))
}

// BadRequest sends an HTTP 400 Bad Request error response.
func BadRequest(c *fiber.Ctx, code string, message string, details ...any) error {
	if code == "" {
		code = "BAD_REQUEST"
	}
	return Error(c, fiber.StatusBadRequest, code, message, details...)
}

// Unauthorized sends an HTTP 401 Unauthorized error response.
func Unauthorized(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Unauthorized access"
	}
	return Error(c, fiber.StatusUnauthorized, "UNAUTHORIZED", message)
}

// Forbidden sends an HTTP 403 Forbidden error response.
func Forbidden(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Access forbidden"
	}
	return Error(c, fiber.StatusForbidden, "FORBIDDEN", message)
}

// NotFound sends an HTTP 404 Not Found error response.
func NotFound(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Resource not found"
	}
	return Error(c, fiber.StatusNotFound, "NOT_FOUND", message)
}

// InternalServerError sends an HTTP 500 Internal Server Error response.
func InternalServerError(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "An internal server error occurred"
	}
	return Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message)
}

func getRequestID(c *fiber.Ctx) string {
	if c == nil {
		return ""
	}
	if id, ok := c.Locals("request_id").(string); ok && id != "" {
		return id
	}
	return c.Get("X-Request-ID")
}
