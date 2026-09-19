"use client";

import React, { useEffect, useState } from "react";
import { TopCategory } from "@/lib/api/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Layers } from "lucide-react";

interface TopCategoriesBarChartProps {
  data: TopCategory[];
}

export default function TopCategoriesBarChart({ data }: TopCategoriesBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as TopCategory;
      return (
        <div className="bg-popover border border-border shadow-md rounded-lg p-3 text-xs">
          <p className="font-semibold text-foreground mb-1">{p.category_name}</p>
          <div className="space-y-0.5 text-muted-foreground">
            <p>
              Revenue: <span className="font-medium text-emerald-500">${Number(p.revenue).toFixed(2)}</span>
            </p>
            <p>
              Items Sold: <span className="font-medium text-foreground">{p.items_sold}</span>
            </p>
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
          <Layers className="w-4 h-4 text-primary" />
          Top Categories Performance
        </CardTitle>
        <CardDescription className="text-xs">
          Revenue contribution and units moved by product category
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          {!isMounted ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              Loading chart...
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-xs text-muted-foreground">
              <Layers className="w-8 h-8 opacity-30 mb-2" />
              <p>No category sales data recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="category_name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  stroke="currentColor"
                  className="text-muted-foreground opacity-70"
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
                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
