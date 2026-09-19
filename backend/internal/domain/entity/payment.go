package entity

import "time"

// PaymentStatus defines the state of a financial transaction.
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusSucceeded PaymentStatus = "succeeded"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

// Payment represents an idempotent financial transaction record.
type Payment struct {
	ID              int64         `json:"id"`
	OrderID         int64         `json:"order_id"`
	UserID          int64         `json:"user_id"`
	Amount          float64       `json:"amount"`
	Currency        string        `json:"currency"`
	Provider        string        `json:"provider"`
	IdempotencyKey  string        `json:"idempotency_key"`
	PaymentIntentID string        `json:"payment_intent_id,omitempty"`
	Status          PaymentStatus `json:"status"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}
