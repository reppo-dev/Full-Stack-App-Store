package database

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TransactionManager provides safe transactional execution over a pgx connection pool.
type TransactionManager struct {
	pool *pgxpool.Pool
}

// NewTransactionManager constructs a new TransactionManager instance.
func NewTransactionManager(pool *pgxpool.Pool) *TransactionManager {
	return &TransactionManager{pool: pool}
}

// ExecuteTx executes an atomic function within a transaction with automatic rollback on error.
func (tm *TransactionManager) ExecuteTx(ctx context.Context, fn func(tx pgx.Tx) error) error {
	if tm == nil || tm.pool == nil {
		return nil
	}

	tx, err := tm.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
