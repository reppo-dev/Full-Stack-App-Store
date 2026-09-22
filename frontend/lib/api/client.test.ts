import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError, normalizeError, apiClient } from '@/lib/api/client';
import { AxiosError } from "axios";

describe("ApiError and normalizeError", () => {
  it("creates an ApiError with explicit fields", () => {
    const err = new ApiError({
      message: "Resource not found",
      statusCode: 404,
      code: "NOT_FOUND",
      requestId: "req-xyz-123",
      details: { id: 10 },
    });

    assert.equal(err.name, "ApiError");
    assert.equal(err.message, "Resource not found");
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, "NOT_FOUND");
    assert.equal(err.requestId, "req-xyz-123");
    assert.deepEqual(err.details, { id: 10 });
  });

  it("normalizes structured backend envelope error", () => {
    const mockAxiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Request failed with status code 422",
      response: {
        status: 422,
        data: {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Email is invalid",
            request_id: "req-999",
            details: [{ field: "email", error: "invalid format" }],
          },
        },
        headers: {},
      },
    } as unknown as AxiosError;

    const normalized = normalizeError(mockAxiosError);
    assert.ok(normalized instanceof ApiError);
    assert.equal(normalized.statusCode, 422);
    assert.equal(normalized.code, "VALIDATION_FAILED");
    assert.equal(normalized.message, "Email is invalid");
    assert.equal(normalized.requestId, "req-999");
    assert.deepEqual(normalized.details, [{ field: "email", error: "invalid format" }]);
  });

  it("normalizes timeout error into REQUEST_TIMEOUT", () => {
    const mockTimeoutError = {
      isAxiosError: true,
      name: "AxiosError",
      code: "ECONNABORTED",
      message: "timeout of 15000ms exceeded",
    } as unknown as AxiosError;

    const normalized = normalizeError(mockTimeoutError);
    assert.equal(normalized.statusCode, 408);
    assert.equal(normalized.code, "REQUEST_TIMEOUT");
  });

  it("verifies apiClient default configuration", () => {
    assert.equal(apiClient.defaults.timeout, 15000);
    assert.equal(apiClient.defaults.withCredentials, true);
  });
});
