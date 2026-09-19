"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  closeCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  hydrateCart,
  CartItem,
} from "@/lib/redux/slices/cartSlice";
import { ordersApi } from "@/lib/api/orders";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Loader2,
  Package,
} from "lucide-react";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isOpen = useAppSelector((state) => state.cart.isOpen);
  const items = useAppSelector((state) => state.cart.items);
  const totalPrice = useAppSelector((state) => state.cart.totalPrice);
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);

  const [view, setView] = useState<"cart" | "checkout">("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phoneNumber: "",
  });

  // Client-side hydration from localStorage to prevent SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashstack_cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(hydrateCart(parsed));
        }
      }
    } catch (e) {
      console.warn("Cart hydration from localStorage failed:", e);
    }
  }, [dispatch]);

  // Reset view when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setView("cart"), 300);
    }
  }, [isOpen]);

  const handleQuantityChange = (id: number, delta: number, current: number, stock: number) => {
    const next = current + delta;
    if (next <= 0) {
      dispatch(removeFromCart(id));
    } else {
      if (stock > 0 && next > stock) {
        toast.info(`Only ${stock} items available in stock`);
        return;
      }
      dispatch(updateQuantity({ id, quantity: next }));
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Shipping address is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: formData.firstName.trim() || undefined,
        last_name: formData.lastName.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        order_items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const order = await ordersApi.create(payload);
      toast.success(`Order #${order.id || order.ID} placed successfully!`);
      dispatch(clearCart());
      dispatch(closeCart());
      router.push("/orderlist");
    } catch (err: any) {
      console.error("Checkout failed:", err);
      toast.error(err.message || "Failed to process checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && dispatch(closeCart())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-background border-l shadow-2xl"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {view === "checkout" ? (
                <button
                  onClick={() => setView("cart")}
                  className="p-1 -ml-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
                  aria-label="Back to Cart"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <ShoppingCart className="w-5 h-5 text-primary" />
              )}
              <SheetTitle className="text-lg font-bold">
                {view === "cart" ? "Shopping Cart" : "Checkout Details"}
              </SheetTitle>
            </div>
            {view === "cart" && totalQuantity > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            {view === "cart"
              ? "Review your items and adjust quantities before checking out."
              : "Enter your shipping details to complete your order."}
          </SheetDescription>
        </SheetHeader>

        {/* Drawer Content */}
        {view === "cart" ? (
          <>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Looks like you haven&apos;t added any products to your cart yet.
                </p>
                <Button
                  onClick={() => dispatch(closeCart())}
                  variant="outline"
                  className="gap-2"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                      {item.image && (item.image.startsWith("http") || item.image.startsWith("/")) ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${item.price.toFixed(2)} each
                      </p>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-md overflow-hidden bg-background">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, -1, item.quantity, item.stock)
                            }
                            className="p-1.5 hover:bg-muted transition text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold select-none min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, 1, item.quantity, item.stock)
                            }
                            disabled={item.stock > 0 && item.quantity >= item.stock}
                            className="p-1.5 hover:bg-muted transition text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="text-muted-foreground hover:text-rose-500 transition p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Footer */}
            {items.length > 0 && (
              <SheetFooter className="p-6 border-t bg-muted/20 space-y-4">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Calculated at next step
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold text-foreground pt-1">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => setView("checkout")}
                    className="w-full gap-2 font-semibold shadow-md py-5"
                    size="lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => dispatch(clearCart())}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-rose-500"
                  >
                    Clear Cart
                  </Button>
                </div>
              </SheetFooter>
            )}
          </>
        ) : (
          /* Checkout View */
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col justify-between">
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-first-name" className="text-xs font-semibold">
                    First Name
                  </Label>
                  <Input
                    id="checkout-first-name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-last-name" className="text-xs font-semibold">
                    Last Name
                  </Label>
                  <Input
                    id="checkout-last-name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-phone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-address" className="text-xs font-semibold">
                  Shipping Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="checkout-address"
                  required
                  placeholder="123 Market St, Suite 400, City, Country"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              {/* Order Mini-Summary */}
              <div className="mt-4 p-4 rounded-xl bg-muted/40 border space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Items ({totalQuantity})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Standard Delivery</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Action Footer */}
            <SheetFooter className="p-6 border-t bg-muted/20 space-y-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 font-semibold shadow-md py-5"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Place Order (${totalPrice.toFixed(2)})
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setView("cart")}
                disabled={isSubmitting}
                className="w-full text-xs text-muted-foreground"
              >
                Back to Cart
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
