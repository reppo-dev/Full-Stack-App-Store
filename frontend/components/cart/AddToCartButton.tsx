"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/store";
import { addToCart, openCart } from "@/lib/redux/slices/cartSlice";
import { Product } from "@/models/modles";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
  inStock: boolean;
  className?: string;
}

export default function AddToCartButton({
  product,
  inStock,
  className = "",
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    if (!inStock) return;

    const prodId = product.id ?? product.ID ?? 0;
    const img =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "";

    dispatch(
      addToCart({
        id: prodId,
        title: product.title,
        price: product.price,
        image: img,
        stock: product.stock ?? 999,
        quantity: 1,
      })
    );
    dispatch(openCart());
    toast.success(`Added "${product.title}" to cart`);
  };

  return (
    <Button
      size="lg"
      disabled={!inStock}
      onClick={handleAddToCart}
      className={`flex-1 gap-2 font-semibold shadow-md ${className}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {inStock ? "Add to Cart" : "Currently Unavailable"}
    </Button>
  );
}
