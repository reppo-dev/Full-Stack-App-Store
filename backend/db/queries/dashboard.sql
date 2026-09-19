-- name: GetDashboardSummary :one
SELECT 
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status != 'cancelled'), 0)::float8 AS total_revenue,
    COUNT(o.id)::int AS total_orders,
    COUNT(o.id) FILTER (WHERE o.status = 'pending')::int AS pending_orders,
    COUNT(o.id) FILTER (WHERE o.status = 'delivered')::int AS delivered_orders,
    (SELECT COUNT(*)::int FROM users) AS total_users,
    (SELECT COUNT(*)::int FROM products WHERE is_active = true) AS active_products,
    (SELECT COUNT(*)::int FROM tickets WHERE status IN ('open', 'in_progress')) AS open_tickets
FROM orders o;

-- name: GetDailyRevenueSeries :many
SELECT 
    DATE(created_at) AS order_date,
    COUNT(id)::int AS order_count,
    COALESCE(SUM(total_amount), 0)::float8 AS revenue
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days' AND status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date ASC;

-- name: GetOrdersStatusBreakdown :many
SELECT 
    status,
    COUNT(*)::int AS count,
    COALESCE(SUM(total_amount), 0)::float8 AS total_amount
FROM orders
GROUP BY status
ORDER BY count DESC;

-- name: GetTopSellingCategories :many
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(oi.id)::int AS items_sold,
    COALESCE(SUM(oi.price * oi.quantity), 0)::float8 AS revenue
FROM categories c
JOIN products p ON p.category_id = c.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY c.id, c.name
ORDER BY revenue DESC
LIMIT 5;

-- name: GetRecentOrdersForDashboard :many
SELECT 
    o.id,
    o.first_name,
    o.last_name,
    o.email,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT $1;

-- name: GetRecentTicketsForDashboard :many
SELECT 
    t.id,
    t.subject,
    t.status,
    t.priority,
    t.category,
    t.created_at,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    u.email AS user_email
FROM tickets t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT $1;
