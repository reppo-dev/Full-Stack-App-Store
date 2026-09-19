"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/models/modles";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/button-favorite";
import { Star, Truck, Flame } from "lucide-react";

interface BestSellersSectionProps {
  products: Product[];
}

export default function BestSellersSection({ products }: BestSellersSectionProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mobiles" | "laptops" | "audio">("all");

  const filteredProducts = products.filter((p) => {
    if (activeTab === "mobiles") return p.category_id === 1;
    if (activeTab === "laptops") return p.category_id === 2;
    if (activeTab === "audio") return p.category_id === 3;
    return true;
  });

  return (
    <section className="w-full my-8">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            <Flame className="w-5 h-5 text-amber-500" />
            Top Selling Electronics
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { key: "all", label: "All Items" },
            { key: "mobiles", label: "Phones & Tablets" },
            { key: "laptops", label: "Laptops & PCs" },
            { key: "audio", label: "Audio & Sound" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {filteredProducts.map((product) => {
          const prodId = product.id ?? product.ID ?? 0;
          const img =
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

          const inStock = (product.stock || 0) > 0;

          return (
            <div
              key={prodId}
              className="bg-card text-card-foreground rounded-2xl border border-border/60 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group relative"
            >
              {/* Wishlist Top Button */}
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton productId={prodId} className="w-8 h-8 rounded-full bg-background/80 shadow-xs backdrop-blur-md" />
              </div>

              {/* Product Image Link */}
              <Link
                href={`/products/${product.slug || prodId}`}
                className="block relative w-full aspect-square mb-3 bg-muted/20 rounded-xl overflow-hidden p-3"
              >
                <Image
                  src={img}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </Link>

              {/* Delivery Badge & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Truck className="w-3.5 h-3.5" />
                  Free Express
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{Number(product.rating || 4.8).toFixed(1)}</span>
                </div>
              </div>

              {/* Title */}
              <Link href={`/products/${product.slug || prodId}`}>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 h-10 leading-snug mb-3 group-hover:text-red-600 transition-colors">
                  {product.title}
                </h3>
              </Link>

              {/* Price and Cart Action */}
              <div className="pt-3 border-t border-border/40 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Price:</span>
                  <span className="text-base font-extrabold text-foreground">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>

                <div className="w-full">
                  <AddToCartButton
                    product={product}
                    inStock={inStock}
                    className="w-full h-9 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
