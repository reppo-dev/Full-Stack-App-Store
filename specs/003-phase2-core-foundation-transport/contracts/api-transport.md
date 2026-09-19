# API Transport Contracts & Normalization

**Feature**: [spec.md](../spec.md)  
**Date**: 2026-09-15  
**Status**: Active  

---

## 1. HTTP Headers Standard

All API requests and responses adhere to the following header conventions:

| Header Name | Type | Direction | Description |
|---|---|---|---|
| `X-Request-ID` | String (UUID v4) | Request & Response | End-to-end correlation identifier. Preserved if incoming; generated if omitted. |
| `Content-Type` | String | Request & Response | Defaults to `application/json; charset=utf-8`. |
| `Accept` | String | Request | Must include `application/json`. |

---

## 2. Standard Response Envelopes

### 2.1 Success Envelope (HTTP 200 OK, 201 Created)

For all new `/api/v1/` routes and modernized endpoints:

```json
{
  "success": true,
  "data": {
    "message": "Operational",
    "timestamp": "2026-09-15T11:00:00Z"
  }
}
```

- When returning a collection with pagination:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

### 2.2 Error Envelope (HTTP 4xx, 5xx)

All client and server errors adhere to a deterministic schema:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The submitted payload is invalid",
    "request_id": "c73a8f4e-289d-4c3e-8f6a-9831d1b28531",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

### 2.3 Common Domain Error Codes

| Error Code | HTTP Status | Meaning |
|---|---|---|
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server error or recovered panic |
| `BAD_REQUEST` | 400 | Malformed JSON or invalid parameters |
| `VALIDATION_FAILED` | 422 | Semantic payload validation error |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token/cookie |
| `FORBIDDEN` | 403 | Authenticated user lacks permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource state conflict (e.g. duplicate email) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests in time window |

---

## 3. Frontend Error Normalization (`ApiError`)

When Axios catches an error or the server returns an error envelope, the transport client normalizes the error into:

```typescript
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor(params: {
    message: string;
    statusCode: number;
    code: string;
    requestId?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.requestId = params.requestId;
    this.details = params.details;
  }
}
```
