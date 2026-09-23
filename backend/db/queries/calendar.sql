-- name: CreateCalendarEvent :one
INSERT INTO calendar_events (
    title,
    description,
    start_date,
    end_date,
    type,
    color,
    address,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: ListCalendarEvents :many
SELECT * FROM calendar_events
ORDER BY start_date ASC;

-- name: GetCalendarEvent :one
SELECT * FROM calendar_events
WHERE id = $1 LIMIT 1;

-- name: UpdateCalendarEvent :one
UPDATE calendar_events
SET 
    title = COALESCE($2, title),
    description = COALESCE($3, description),
    start_date = COALESCE($4, start_date),
    end_date = COALESCE($5, end_date),
    type = COALESCE($6, type),
    color = COALESCE($7, color),
    address = COALESCE($8, address),
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteCalendarEvent :exec
DELETE FROM calendar_events
WHERE id = $1;
