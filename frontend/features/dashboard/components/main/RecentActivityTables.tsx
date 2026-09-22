"use client";

import React from "react";
import { RecentOrder, RecentTicket } from "@/features/dashboard/api/dashboard.client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LifeBuoy, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface RecentActivityTablesProps {
  recentOrders: RecentOrder[];
  recentTickets: RecentTicket[];
}

export default function RecentActivityTables({
  recentOrders,
  recentTickets,
}: RecentActivityTablesProps) {
  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5">Delivered</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] py-0 px-1.5">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">{status}</Badge>;
    }
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] py-0 px-1.5">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] py-0 px-1.5">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary" className="opacity-70 text-[10px] py-0 px-1.5">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] py-0 px-1.5">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return <Badge className="bg-rose-500 text-white text-[10px] py-0 px-1.5 border-none">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-500 text-white text-[10px] py-0 px-1.5 border-none">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500 text-white text-[10px] py-0 px-1.5 border-none">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">Low</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Latest transactions processed through the checkout pipeline
            </CardDescription>
          </div>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No recent orders recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground border-y">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Order</th>
                    <th className="py-2.5 px-4 font-medium">Customer</th>
                    <th className="py-2.5 px-4 font-medium">Total</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate max-w-[140px]">
                          {order.customer || "Customer"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {order.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {getOrderStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Support Inquiries */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-primary" />
              Recent Support Tickets
            </CardTitle>
            <CardDescription className="text-xs">
              Customer inquiries and active operations tickets
            </CardDescription>
          </div>
          <Link href="/inbox">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No recent support tickets.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground border-y">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Ticket</th>
                    <th className="py-2.5 px-4 font-medium">Customer</th>
                    <th className="py-2.5 px-4 font-medium">Priority</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground line-clamp-1 max-w-[140px]" title={t.subject}>
                          {t.subject}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          #{t.id} • {t.category || "General"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground truncate max-w-[120px]">
                          {t.customer || "User"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {t.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="py-3 px-4">
                        {getTicketStatusBadge(t.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/inbox/${t.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
