"use client";

import React, { useEffect, useState } from "react";
import { ordersApi, Order, OrderItem } from "@/features/orders/api/orders.client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Download,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminOrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const fetchOrders = async (targetPage: number) => {
    setIsLoading(true);
    try {
      const res = await ordersApi.listAll({ page: targetPage, limit: 10 });
      setOrders(res.data);
      setLastPage(res.meta.last_page || 1);
      setTotalCount(res.meta.total || res.data.length);
    } catch (error: any) {
      console.error("Error fetching admin orders:", error);
      toast.error(error.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await ordersApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Orders CSV exported successfully!");
    } catch (err: any) {
      console.error("Export CSV failed:", err);
      toast.error(err.message || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const select = (id: number) => {
    setSelected(selected !== id ? id : null);
  };

  return (
    <div className="container mx-auto pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, inspect, and export all customer orders.
          </p>
        </div>
        <Button
          onClick={handleExportCsv}
          disabled={isExporting}
          variant="outline"
          className="gap-2 shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto shadow-sm rounded-xl border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order.id || order.ID;
                const isSelected = selected === orderId;

                return (
                  <React.Fragment key={orderId}>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{orderId}</td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {order.name || `${order.first_name} ${order.last_name}`}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{order.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => select(orderId)}
                          className="gap-1 text-xs"
                        >
                          {isSelected ? "Hide" : "Details"}
                          {isSelected ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>

                    {isSelected && (
                      <tr className="bg-muted/10">
                        <td colSpan={6} className="p-4 border-b">
                          <div className="py-4 px-6 rounded-xl bg-card border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Order Items ({order.order_items?.length || 0})
                            </h4>
                            <div className="rounded-lg border overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead className="text-xs bg-muted/40 border-b text-muted-foreground font-semibold">
                                  <tr>
                                    <th className="py-2.5 px-4">#</th>
                                    <th className="py-2.5 px-4">Product Title</th>
                                    <th className="py-2.5 px-4 text-center">Quantity</th>
                                    <th className="py-2.5 px-4 text-right">Price</th>
                                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {(order.order_items || []).map((e, idx) => (
                                    <tr key={e.id || e.ID || idx}>
                                      <td className="py-2 px-4 text-muted-foreground font-mono">
                                        {e.id || e.ID || idx + 1}
                                      </td>
                                      <td className="py-2 px-4 font-medium text-foreground">
                                        {e.product_title}
                                      </td>
                                      <td className="py-2 px-4 text-center font-mono">
                                        {e.quantity}
                                      </td>
                                      <td className="py-2 px-4 text-right text-muted-foreground">
                                        ${e.price.toFixed(2)}
                                      </td>
                                      <td className="py-2 px-4 text-right font-semibold text-foreground">
                                        ${(e.price * e.quantity).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {lastPage} ({totalCount} total)
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
