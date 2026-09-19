"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi, Order, OrderItem } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  PackageCheck,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Mail,
  Receipt,
} from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const fetchOrders = async (targetPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getMyOrders({ page: targetPage, limit: 10 });
      setOrders(res.data);
      setTotalPages(res.meta.last_page || 1);
      setTotalCount(res.meta.total || res.data.length);
      // Automatically expand first order for quick preview
      if (res.data.length > 0 && targetPage === 1) {
        setExpandedOrders(new Set([res.data[0].id || res.data[0].ID]));
      }
    } catch (err: any) {
      console.error("Failed to fetch customer orders:", err);
      setError(
        err.message || "Unable to retrieve your orders. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const toggleExpand = (orderId: number) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-primary" />
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your order statuses and review past purchase receipts.
          </p>
        </div>
        {!isLoading && totalCount > 0 && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary self-start sm:self-auto">
            {totalCount} {totalCount === 1 ? "order" : "orders"}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center max-w-md mx-auto my-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Could not load orders
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => fetchOrders(page)}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-16 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No orders placed yet
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            When you complete a purchase, your order history and live tracking details will appear right here.
          </p>
          <Button asChild size="lg" className="gap-2 shadow-md">
            <Link href="/products">
              <ShoppingBag className="w-4 h-4" />
              Browse Catalog
            </Link>
          </Button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderId = order.id || order.ID;
            const isExpanded = expandedOrders.has(orderId);
            const items = order.order_items || [];

            return (
              <div
                key={orderId}
                className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Summary Bar */}
                <div
                  onClick={() => toggleExpand(orderId)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-foreground">
                        Order #{orderId}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(order.created_at)}
                      </span>
                      {order.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {order.email}
                        </span>
                      )}
                      <span>
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      aria-label={isExpanded ? "Collapse order" : "Expand order"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-muted/15 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Shipping Address if present */}
                    {order.address && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-background border">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">
                            Shipping Destination:
                          </span>{" "}
                          {order.address}
                          {order.phone_number && (
                            <span className="ml-2 font-mono">
                              ({order.phone_number})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="rounded-xl border bg-background overflow-hidden">
                      <div className="p-3 bg-muted/40 border-b text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                        <span>Product</span>
                        <div className="flex gap-12 mr-2">
                          <span>Qty</span>
                          <span>Price</span>
                          <span className="w-16 text-right">Subtotal</span>
                        </div>
                      </div>

                      <div className="divide-y">
                        {items.map((item, idx) => (
                          <div
                            key={item.id || item.ID || idx}
                            className="p-4 flex items-center justify-between gap-4 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border">
                                <Package className="w-5 h-5 stroke-1" />
                              </div>
                              <span className="font-medium text-foreground">
                                {item.product_title}
                              </span>
                            </div>

                            <div className="flex items-center gap-12 text-muted-foreground text-sm mr-2">
                              <span className="w-6 text-center font-mono">
                                {item.quantity}
                              </span>
                              <span className="w-14 text-right">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="w-16 text-right font-semibold text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
