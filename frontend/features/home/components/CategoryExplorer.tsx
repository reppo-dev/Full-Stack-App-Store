"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryCard {
  id: number;
  name: string;
  slug?: string;
  image_url?: string;
}

interface CategoryExplorerProps {
  categories?: any[];
}

export default function CategoryExplorer({ categories = [] }: CategoryExplorerProps) {
  // Take top 6 categories or whatever is available, defaulting to empty if none
  const displayCategories = categories.slice(0, 6);

  if (displayCategories.length === 0) return null;

  return (
    <section className="w-full my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 bg-red-600 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayCategories.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            href={`/products?category_id=${cat.id}`}
            className="group relative flex flex-col items-center justify-center p-6 bg-card border border-border/60 hover:border-border rounded-3xl transition-all duration-300 hover:shadow-sm overflow-hidden"
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative w-24 h-24 mb-4 transition-transform duration-500 group-hover:scale-110">
              <Image
                src={cat.image_url || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"}
                alt={cat.name}
                fill
                className="object-contain drop-shadow-sm"
              />
            </div>
            
            <h3 className="text-sm font-bold text-foreground text-center line-clamp-1 group-hover:text-red-600 transition-colors">
              {cat.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Explore Products
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
