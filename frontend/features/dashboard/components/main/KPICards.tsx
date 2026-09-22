"use client";

import React from "react";
import { DashboardSummary } from "@/features/dashboard/api/dashboard.client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingBag,
  Users,
  LifeBuoy,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface KPICardsProps {
  summary: DashboardSummary;
}

export default function KPICards({ summary }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.total_revenue),
      subtext: "Gross platform sales to date",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accent: "from-emerald-500/10 to-transparent",
      badge: (
        <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
          <TrendingUp className="w-3 h-3" /> Live
        </Badge>
      ),
    },
    {
      title: "Total Orders",
      value: (summary.total_orders || 0).toLocaleString(),
      subtext: `${summary.delivered_orders || 0} delivered, ${summary.pending_orders || 0} pending`,
      icon: ShoppingBag,
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      accent: "from-sky-500/10 to-transparent",
      badge: (
        <div className="flex gap-1">
          <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-none text-[10px] py-0 px-1.5">
            {summary.pending_orders || 0} Pending
          </Badge>
        </div>
      ),
    },
    {
      title: "Customers & Catalog",
      value: `${(summary.total_users || 0).toLocaleString()} Users`,
      subtext: `${summary.active_products || 0} active catalog products`,
      icon: Users,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      accent: "from-purple-500/10 to-transparent",
      badge: (
        <Badge variant="outline" className="text-[10px] gap-1">
          <Package className="w-3 h-3 text-purple-500" /> Catalog
        </Badge>
      ),
    },
    {
      title: "Open Tickets",
      value: (summary.open_tickets || 0).toString(),
      subtext: summary.open_tickets > 0 ? "Requires customer service attention" : "All inquiries resolved",
      icon: LifeBuoy,
      iconBg:
        summary.open_tickets > 0
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accent: summary.open_tickets > 0 ? "from-amber-500/10 to-transparent" : "from-emerald-500/10 to-transparent",
      badge: (
        <Badge
          className={`text-[10px] border-none ${
            summary.open_tickets > 0
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {summary.open_tickets > 0 ? "Action Required" : "Healthy"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={idx}
            className="relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Subtle gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none opacity-50`} />

            <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  {card.badge}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {card.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
