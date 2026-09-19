"use client";

import React, { useEffect, useState } from "react";
import { DailyRevenue } from "@/lib/api/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface RevenueAnalyticsChartProps {
  data: DailyRevenue[];
}

export default function RevenueAnalyticsChart({ data }: RevenueAnalyticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalRevenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalOrders = data.reduce((acc, curr) => acc + (curr.order_count || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as DailyRevenue;
      return (
        <div className="bg-popover border border-border shadow-md rounded-lg p-3 text-xs">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-500 font-medium">
              Revenue: ${Number(p.revenue).toFixed(2)}
            </p>
            <p className="text-muted-foreground">
              Orders: {p.order_count}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Revenue Trend (30 Days)
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Daily platform gross revenue and volume progression
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-muted-foreground block text-[11px]">Period Total</span>
            <span className="font-bold text-foreground">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="text-right hidden sm:block">
            <span className="text-muted-foreground block text-[11px]">Orders</span>
            <span className="font-bold text-foreground">{totalOrders}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          {!isMounted ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              Loading chart...
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-xs text-muted-foreground">
              <Calendar className="w-8 h-8 opacity-30 mb-2" />
              <p>No revenue records found for this period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  stroke="currentColor"
                  className="text-muted-foreground opacity-70"
                  tickFormatter={(val) => {
                    if (typeof val === "string" && val.length >= 10) {
                      return val.slice(5); // MM-DD
                    }
                    return val;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  stroke="currentColor"
                  className="text-muted-foreground opacity-70"
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
