-- name: CreateTicket :one
INSERT INTO tickets (
    user_id,
    subject,
    status,
    priority,
    category,
    assigned_to,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, NOW(), NOW()
)
RETURNING *;

-- name: GetTicketByID :one
SELECT 
    t.*,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    u.email AS user_email,
    a.first_name AS assigned_first_name,
    a.last_name AS assigned_last_name
FROM tickets t
JOIN users u ON t.user_id = u.id
LEFT JOIN users a ON t.assigned_to = a.id
WHERE t.id = $1;

-- name: ListTicketsByUserID :many
SELECT 
    t.*,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    u.email AS user_email,
    (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id) AS message_count
FROM tickets t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = $1
ORDER BY t.updated_at DESC
LIMIT $2 OFFSET $3;

-- name: CountTicketsByUserID :one
SELECT COUNT(*) FROM tickets WHERE user_id = $1;

-- name: ListAllTickets :many
SELECT 
    t.*,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    u.email AS user_email,
    a.first_name AS assigned_first_name,
    a.last_name AS assigned_last_name,
    (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id) AS message_count
FROM tickets t
JOIN users u ON t.user_id = u.id
LEFT JOIN users a ON t.assigned_to = a.id
WHERE 
    (sqlc.narg('status')::varchar IS NULL OR t.status = sqlc.narg('status')) AND
    (sqlc.narg('priority')::varchar IS NULL OR t.priority = sqlc.narg('priority'))
ORDER BY t.updated_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllTickets :one
SELECT COUNT(*) 
FROM tickets
WHERE 
    (sqlc.narg('status')::varchar IS NULL OR status = sqlc.narg('status')) AND
    (sqlc.narg('priority')::varchar IS NULL OR priority = sqlc.narg('priority'));

-- name: UpdateTicketStatus :one
UPDATE tickets
SET 
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: AssignTicket :one
UPDATE tickets
SET 
    assigned_to = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: CreateTicketMessage :one
INSERT INTO ticket_messages (
    ticket_id,
    sender_id,
    message,
    is_internal,
    created_at
) VALUES (
    $1, $2, $3, $4, NOW()
)
RETURNING *;

-- name: ListTicketMessagesByTicketID :many
SELECT 
    tm.*,
    u.first_name AS sender_first_name,
    u.last_name AS sender_last_name,
    u.email AS sender_email,
    u.image AS sender_image,
    r.name AS sender_role
FROM ticket_messages tm
JOIN users u ON tm.sender_id = u.id
LEFT JOIN roles r ON u.role_id = r.id
WHERE tm.ticket_id = $1
ORDER BY tm.created_at ASC;

-- name: CountUnresolvedTickets :one
SELECT COUNT(*)
FROM tickets
WHERE status IN ('open', 'in_progress');
