"use client";

import React, { useEffect, useState } from "react";
import { OrderStatusBreakdown } from "@/features/dashboard/api/dashboard.client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface OrderStatusPieChartProps {
  data: OrderStatusBreakdown[];
}

const STATUS_COLORS: Record<string, string> = {
  delivered: "#10b981",
  completed: "#10b981",
  pending: "#f59e0b",
  processing: "#0284c7",
  shipped: "#6366f1",
  cancelled: "#ef4444",
  refunded: "#ec4899",
};

const DEFAULT_COLOR = "#8b5cf6";

export default function OrderStatusPieChart({ data }: OrderStatusPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalOrders = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const chartData = data.map((item) => ({
    name: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Unknown",
    value: item.count,
    amount: item.total_amount,
    color: STATUS_COLORS[item.status.toLowerCase()] || DEFAULT_COLOR,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      const percentage = totalOrders > 0 ? ((p.value / totalOrders) * 100).toFixed(1) : "0";
      return (
        <div className="bg-popover border border-border shadow-md rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="font-semibold text-foreground">{p.name}</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground">
            <p>
              Count: <span className="font-medium text-foreground">{p.value}</span> ({percentage}%)
            </p>
            {p.amount > 0 && (
              <p>
                Value: <span className="font-medium text-foreground">${Number(p.amount).toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-primary" />
          Order Status Breakdown
        </CardTitle>
        <CardDescription className="text-xs">
          Proportion of orders by fulfillment lifecycle
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          {!isMounted ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              Loading chart...
            </div>
          ) : chartData.length === 0 || totalOrders === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-xs text-muted-foreground">
              <PieChartIcon className="w-8 h-8 opacity-30 mb-2" />
              <p>No order distribution data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground capitalize">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
