import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

export interface ApiErrorParams {
  message: string;
  statusCode: number;
  code?: string;
  requestId?: string;
  details?: unknown;
}

/**
 * Normalized API error class representing consistent error diagnostics
 * across all backend and network communication.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor({ message, statusCode, code, requestId, details }: ApiErrorParams) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code || "UNKNOWN_ERROR";
    this.requestId = requestId;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Centralized Axios client instance configured for backend transport.
 * Enforces timeout (15s), withCredentials (true), and error normalization.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Injects request headers and tracing metadata
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};
    // Ensure credentials flag is preserved
    config.withCredentials = true;
    return config;
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error));
  }
);

// Response Interceptor: Normalizes error structures and handles server responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error));
  }
);

/**
 * Transforms an arbitrary error or AxiosError into a strongly-typed ApiError.
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;
    const status = axiosErr.response?.status || 0;
    const data = axiosErr.response?.data;
    const reqId =
      data?.error?.request_id ||
      (axiosErr.response?.headers
        ? (axiosErr.response.headers["x-request-id"] as string | undefined)
        : undefined);

    // Standard backend envelope error format: { success: false, error: { code, message, request_id, details } }
    if (data && typeof data === "object" && data.error) {
      return new ApiError({
        message: data.error.message || "An unexpected error occurred",
        statusCode: status,
        code: data.error.code || getDefaultCodeForStatus(status),
        requestId: reqId,
        details: data.error.details,
      });
    }

    // Legacy or alternative backend format: { message: "..." }
    if (data && typeof data === "object" && typeof data.message === "string") {
      return new ApiError({
        message: data.message,
        statusCode: status,
        code: getDefaultCodeForStatus(status),
        requestId: reqId,
      });
    }

    // Network timeout
    if (axiosErr.code === "ECONNABORTED" || axiosErr.message.includes("timeout")) {
      return new ApiError({
        message: "The request timed out after 15 seconds. Please try again.",
        statusCode: 408,
        code: "REQUEST_TIMEOUT",
        requestId: reqId,
      });
    }

    // Network disconnection / no response received
    if (axiosErr.request && !axiosErr.response) {
      return new ApiError({
        message: "Network error: Unable to reach the backend server.",
        statusCode: 0,
        code: "NETWORK_ERROR",
      });
    }

    return new ApiError({
      message: axiosErr.message || "An unexpected network error occurred",
      statusCode: status,
      code: getDefaultCodeForStatus(status),
      requestId: reqId,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      statusCode: 0,
      code: "CLIENT_ERROR",
    });
  }

  return new ApiError({
    message: "An unknown error occurred",
    statusCode: 0,
    code: "UNKNOWN_ERROR",
  });
}

function getDefaultCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 408:
      return "REQUEST_TIMEOUT";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_FAILED";
    case 429:
      return "RATE_LIMIT_EXCEEDED";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 502:
      return "BAD_GATEWAY";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return status >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR";
  }
}
