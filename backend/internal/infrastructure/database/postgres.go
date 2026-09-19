package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresPool manages the pgxpool connection pool.
type PostgresPool struct {
	Pool *pgxpool.Pool
}

// NewPostgresPool initializes and returns a tuned pgx connection pool.
func NewPostgresPool(ctx context.Context, dsn string) (*PostgresPool, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("unable to parse database DSN: %w", err)
	}

	// Performance pool tuning
	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 1 * time.Hour
	config.MaxConnIdleTime = 30 * time.Minute
	config.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Ping database with timeout
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping PostgreSQL: %w", err)
	}

	return &PostgresPool{Pool: pool}, nil
}

// Close terminates all active pool connections cleanly.
func (p *PostgresPool) Close() {
	if p.Pool != nil {
		p.Pool.Close()
	}
}
