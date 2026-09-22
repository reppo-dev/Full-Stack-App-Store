"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryCard {
  id: number;
  name: string;
  countText: string;
  href: string;
  imageUrl: string;
}

const categories: CategoryCard[] = [
  {
    id: 1,
    name: "Smartphones & Tablets",
    countText: "30+ Products",
    href: "/products?category_id=1",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Laptops & Computers",
    countText: "20+ Products",
    href: "/products?category_id=2",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Audio & Headphones",
    countText: "15+ Products",
    href: "/products?category_id=3",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Wearable Tech",
    countText: "10+ Products",
    href: "/products?category_id=4",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Gaming & Consoles",
    countText: "25+ Products",
    href: "/products?category_id=5",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
  },
];

export default function CategoryExplorer() {
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
          <span>View All Departments</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="bg-card hover:bg-muted/40 border border-border/60 rounded-2xl p-4 flex flex-col items-center text-center group transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 rounded-full overflow-hidden p-2 bg-muted/30 group-hover:scale-105 transition-transform duration-300">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="120px"
                className="object-cover rounded-full p-1"
                unoptimized
              />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {cat.name}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {cat.countText}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
