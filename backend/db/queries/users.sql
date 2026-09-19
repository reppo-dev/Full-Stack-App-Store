-- name: GetUserByID :one
SELECT 
    u.id, u.created_at, u.updated_at, u.deleted_at,
    u.first_name, u.last_name, u.image, u.user_name,
    u.phone_number, u.date_of_birth, u.email, u.password, u.role_id,
    COALESCE(r.name, 'customer')::text AS role_name
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.id = $1 AND u.deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT 
    u.id, u.created_at, u.updated_at, u.deleted_at,
    u.first_name, u.last_name, u.image, u.user_name,
    u.phone_number, u.date_of_birth, u.email, u.password, u.role_id,
    COALESCE(r.name, 'customer')::text AS role_name
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.email = $1 AND u.deleted_at IS NULL;

-- name: GetUserByUsername :one
SELECT 
    u.id, u.created_at, u.updated_at, u.deleted_at,
    u.first_name, u.last_name, u.image, u.user_name,
    u.phone_number, u.date_of_birth, u.email, u.password, u.role_id,
    COALESCE(r.name, 'customer')::text AS role_name
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.user_name = $1 AND u.deleted_at IS NULL;

-- name: ListUsers :many
SELECT 
    u.id, u.created_at, u.updated_at, u.deleted_at,
    u.first_name, u.last_name, u.image, u.user_name,
    u.phone_number, u.date_of_birth, u.email, u.role_id,
    COALESCE(r.name, 'customer')::text AS role_name
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.deleted_at IS NULL
ORDER BY u.id ASC
LIMIT $1 OFFSET $2;

-- name: ListAllUsers :many
SELECT 
    u.id, u.created_at, u.updated_at, u.deleted_at,
    u.first_name, u.last_name, u.image, u.user_name,
    u.phone_number, u.date_of_birth, u.email, u.role_id,
    COALESCE(r.name, 'customer')::text AS role_name
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.deleted_at IS NULL
ORDER BY u.id ASC;

-- name: CountUsers :one
SELECT COUNT(*) FROM users
WHERE deleted_at IS NULL;

-- name: CreateUser :one
INSERT INTO users (
    first_name, last_name, image, user_name, phone_number,
    date_of_birth, email, password, role_id, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
RETURNING id, created_at, updated_at, deleted_at, first_name, last_name, image, user_name, phone_number, date_of_birth, email, password, role_id;

-- name: UpdateUser :one
UPDATE users
SET 
    first_name = $2,
    last_name = $3,
    image = $4,
    user_name = $5,
    phone_number = $6,
    email = $7,
    role_id = $8,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, created_at, updated_at, deleted_at, first_name, last_name, image, user_name, phone_number, date_of_birth, email, role_id;

-- name: UpdateUserProfile :one
UPDATE users
SET 
    first_name = $2,
    last_name = $3,
    image = $4,
    phone_number = $5,
    email = $6,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, created_at, updated_at, deleted_at, first_name, last_name, image, user_name, phone_number, date_of_birth, email, role_id;

-- name: UpdateUserPassword :exec
UPDATE users
SET 
    password = $2,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: DeleteUser :exec
UPDATE users
SET deleted_at = NOW()
WHERE id = $1;

-- name: HardDeleteUser :exec
DELETE FROM users
WHERE id = $1;
