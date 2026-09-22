"use client";

import React, { useEffect, useState } from "react";
import { dashboardApi, DashboardMetrics } from "@/features/dashboard/api/dashboard.client";
import KPICards from "@/features/dashboard/components/main/KPICards";
import RevenueAnalyticsChart from "@/features/dashboard/components/main/RevenueAnalyticsChart";
import OrderStatusPieChart from "@/features/dashboard/components/main/OrderStatusPieChart";
import TopCategoriesBarChart from "@/features/dashboard/components/main/TopCategoriesBarChart";
import RecentActivityTables from "@/features/dashboard/components/main/RecentActivityTables";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, LayoutDashboard, AlertCircle, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>("30d");

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getMetrics(timeframe);
      setMetrics(data);
    } catch (err) {
      setError(
        (err as Error)?.message ||
          "Failed to load dashboard metrics. Ensure you are signed in with administrative privileges."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 py-6 space-y-6 max-w-[1600px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time platform metrics, sales analytics, and customer support operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
            className="h-9 text-xs"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && !metrics ? (
        <div className="flex flex-col items-center justify-center min-h-[450px] text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-primary" />
          <p className="text-sm font-medium">Aggregating live operational intelligence...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] p-8 border border-destructive/30 rounded-xl bg-destructive/5 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mb-2" />
          <h3 className="text-base font-semibold text-destructive">Analytics Unavailable</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchMetrics} className="text-xs">
            Try Again
          </Button>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <KPICards summary={metrics.summary} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueAnalyticsChart data={metrics.revenue_series || []} />
            </div>
            <div className="lg:col-span-1">
              <OrderStatusPieChart data={metrics.orders_breakdown || []} />
            </div>
          </div>

          {/* Category Performance */}
          <TopCategoriesBarChart data={metrics.top_categories || []} />

          {/* Recent Operations Tables */}
          <RecentActivityTables
            recentOrders={metrics.recent_orders || []}
            recentTickets={metrics.recent_tickets || []}
          />
        </div>
      ) : null}
    </div>
  );
}
