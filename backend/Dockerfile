# ==============================================================================
# Build Stage (Go 1.24+ Static Binary Compilation)
# ==============================================================================
FROM golang:alpine AS builder

WORKDIR /src

# Leverage Docker cache layer for dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source tree and compile static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# ==============================================================================
# Final Minimal Runtime Stage (Alpine Non-Root)
# ==============================================================================
FROM alpine:3.20 AS runner

# Install essential runtime utilities for certificates, timezone, and healthcheck
RUN apk --no-cache add ca-certificates tzdata wget

# Create non-root system group and user
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

WORKDIR /app

# Copy compiled binary from builder stage
COPY --from=builder --chown=appuser:appgroup /app/server /app/server

# Create uploads directory with appropriate permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

# Execute as unprivileged non-root user
USER appuser:appgroup

EXPOSE 8000

CMD ["/app/server"]
