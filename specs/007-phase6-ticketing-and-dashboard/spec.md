# Specification: Phase 6 — Support, Intelligence & Operations (Ticketing & Dashboard)

## Goal
Build the autonomous Support Ticketing domain from scratch in Go and PostgreSQL, replace dummy inbox mock strings with a functional two-pane conversation UI, and connect the executive Dashboard to real aggregated database metrics and charts.

## Functional Requirements
1. **Support Ticketing**:
   - Tickets schema: `tickets` (id, user_id, subject, status, priority, category, assigned_to, created_at, updated_at).
   - Messages schema: `ticket_messages` (id, ticket_id, sender_id, message, is_internal, created_at).
   - Statuses: `open`, `in_progress`, `resolved`, `closed`.
   - Priorities: `low`, `medium`, `high`, `urgent`.
   - Customer scope: Customers can create tickets, view their own tickets, and reply.
   - Admin scope: Admins can view all tickets, filter by status/priority, assign tickets, change status, and post replies or internal notes.
2. **Operational Dashboard**:
   - Aggregated metrics: Total Revenue, Total Orders (and status breakdown), Active Users, Unresolved Tickets count, New Customers this week.
   - Time-series analytics: Daily revenue trend over the past 30 days.
   - Category distribution: Total items sold and revenue per category.
   - Recent activity: Top 5 recent orders and top 5 recent support tickets.
3. **Frontend UI**:
   - `/inbox`: Two-pane interface with left pane ticket list/filters and right pane active thread/reply form.
   - `/dashboard`: Real KPI metric cards, live Recharts (Revenue Trend, Orders by Status, Category Sales), and recent activity lists.
