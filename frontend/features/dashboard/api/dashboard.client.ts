import { apiClient } from '@/lib/api/client';

export interface DailyRevenue {
  date: string;
  order_count: number;
  revenue: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  total_amount: number;
}

export interface TopCategory {
  category_id: number;
  category_name: string;
  items_sold: number;
  revenue: number;
}

export interface RecentOrder {
  id: number;
  customer: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
}

export interface RecentTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  category: string;
  customer: string;
  email: string;
  created_at: string;
}

export interface DashboardSummary {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  total_users: number;
  active_products: number;
  open_tickets: number;
}

export interface DashboardMetrics {
  summary: DashboardSummary;
  revenue_series: DailyRevenue[];
  orders_breakdown: OrderStatusBreakdown[];
  top_categories: TopCategory[];
  recent_orders: RecentOrder[];
  recent_tickets: RecentTicket[];
}

export const dashboardApi = {
  /**
   * Fetch aggregated operational and financial dashboard metrics.
   */
  async getMetrics(timeframe?: string): Promise<DashboardMetrics> {
    const res = await apiClient.get("/api/v1/dashboard/metrics", {
      params: timeframe ? { timeframe } : undefined,
    });
    return res.data.data || res.data;
  },
};
