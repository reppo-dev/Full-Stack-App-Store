-- +goose Up
-- ==============================================================================
-- Calendar Events Table
-- ==============================================================================

CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- +goose Down
-- ==============================================================================
-- Revert Calendar Events Table
-- ==============================================================================

DROP TABLE IF EXISTS calendar_events;
