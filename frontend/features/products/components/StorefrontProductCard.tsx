"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/models/modles";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import FavoriteButton from "@/features/favorites/components/button-favorite";
import { Star, Truck, ShieldCheck, Sparkles } from "lucide-react";

export default function CardProducts({ props }: { props: Product }) {
  const prodId = props.id ?? props.ID ?? 0;
  const slugOrId = props.slug || prodId;
  const productUrl = `/products/${slugOrId}`;

  const primaryImage =
    Array.isArray(props.images) && props.images.length > 0
      ? props.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  const inStock = (props.stock ?? 0) > 0;
  const price = Number(props.price || 0);

  // Simulated attractive discount for high visual fidelity
  const discountPercent = (Number(prodId) * 7) % 25 + 10;
  const originalPrice = (price * (100 + discountPercent)) / 100;

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-4 flex flex-col justify-between hover:shadow-xl hover:border-red-500/30 transition-all duration-300 group relative">
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
          {discountPercent}% OFF
        </span>
      </div>

      {/* Wishlist Heart Button */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          productId={Number(prodId)}
          className="w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow-xs backdrop-blur-md transition-transform active:scale-95"
        />
      </div>

      {/* Clickable Product Image */}
      <Link
        href={productUrl}
        className="block relative w-full aspect-square mb-3 bg-muted/20 rounded-xl overflow-hidden p-3 group-hover:bg-muted/30 transition-colors"
      >
        <Image
          src={primaryImage}
          alt={props.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain p-2 group-hover:scale-108 transition-transform duration-300"
          unoptimized
        />
      </Link>

      {/* Delivery & Rating Metadata */}
      <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Truck className="w-3.5 h-3.5" />
          Free Express
        </span>
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>{Number(props.rating || 4.8).toFixed(1)}</span>
        </div>
      </div>

      {/* Title */}
      <Link href={productUrl}>
        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 h-10 leading-snug mb-3 group-hover:text-red-600 transition-colors">
          {props.title}
        </h3>
      </Link>

      {/* Price Block & Action Button */}
      <div className="pt-3 border-t border-border/40 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground line-through">
            ${originalPrice.toFixed(0)}
          </span>
          <div className="text-right">
            <span className="text-base font-extrabold text-foreground tracking-tight">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stock Status Bar */}
        <div className="space-y-0.5">
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                inStock ? "bg-emerald-500" : "bg-rose-500"
              }`}
              style={{ width: inStock ? `${Math.min(100, Math.max(25, (props.stock || 10) * 4))}%` : "0%" }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium block">
            {inStock ? `${props.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {/* Add to Cart CTA */}
        <div className="w-full pt-1">
          <AddToCartButton
            product={props}
            inStock={inStock}
            className="w-full h-9 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition-transform active:scale-98"
          />
        </div>
      </div>
    </div>
  );
}
