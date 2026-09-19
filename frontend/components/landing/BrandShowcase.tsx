"use client";

import React from "react";
import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";

interface BrandItem {
  name: string;
  category: string;
  href: string;
}

const brands: BrandItem[] = [
  { name: "Apple", category: "iOS & Mac", href: "/products?search=Apple" },
  { name: "Samsung", category: "Galaxy & AI", href: "/products?search=Samsung" },
  { name: "Sony", category: "Audio & PS5", href: "/products?search=Sony" },
  { name: "Bose", category: "Acoustics", href: "/products?search=Bose" },
  { name: "Dell", category: "XPS Laptops", href: "/products?search=Dell" },
  { name: "Logitech", category: "Peripherals", href: "/products?search=Logitech" },
  { name: "Keychron", category: "Keyboards", href: "/products?search=Keychron" },
  { name: "Nintendo", category: "Consoles", href: "/products?search=Nintendo" },
];

export default function BrandShowcase() {
  return (
    <section className="w-full my-8 bg-card border border-border/60 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Popular Tech Brands
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group"
        >
          <span>View All Brands</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {brands.map((b) => (
          <Link
            key={b.name}
            href={b.href}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/40 hover:border-border transition-all duration-200 group text-center"
          >
            <span className="text-base font-extrabold tracking-wider text-foreground group-hover:text-red-600 transition-colors">
              {b.name}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {b.category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
