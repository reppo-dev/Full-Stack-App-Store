"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import CartDrawer from "./CartDrawer";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { openCart } from "@/lib/redux/slices/cartSlice";

export default function HeaderCartButton() {
  const dispatch = useAppDispatch();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);

  return (
    <>
      <button
        onClick={() => dispatch(openCart())}
        className="relative p-2.5 rounded-full hover:bg-muted transition text-foreground flex items-center justify-center cursor-pointer"
        aria-label="Shopping Cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm animate-in zoom-in">
            {totalQuantity > 99 ? "99+" : totalQuantity}
          </span>
        )}
      </button>
      <CartDrawer />
    </>
  );
}
