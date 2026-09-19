"use client";

import React from "react";
import Link from "next/link";
import { Award, ChevronLeft } from "lucide-react";

interface BrandItem {
  name: string;
  enName: string;
  href: string;
}

const brands: BrandItem[] = [
  { name: "اپل", enName: "Apple", href: "/products?search=Apple" },
  { name: "سامسونگ", enName: "Samsung", href: "/products?search=Samsung" },
  { name: "سونی", enName: "Sony", href: "/products?search=Sony" },
  { name: "بوز", enName: "Bose", href: "/products?search=Bose" },
  { name: "دل", enName: "Dell", href: "/products?search=Dell" },
  { name: "لاجیتک", enName: "Logitech", href: "/products?search=Logitech" },
  { name: "کی‌کرون", enName: "Keychron", href: "/products?search=Keychron" },
  { name: "نینتندو", enName: "Nintendo", href: "/products?search=Nintendo" },
];

export default function BrandShowcase() {
  return (
    <section className="w-full my-8 bg-card border border-border/60 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            محبوب‌ترین برندهای دیجیتال
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group"
        >
          <span>مشاهده همه برندها</span>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {brands.map((b) => (
          <Link
            key={b.enName}
            href={b.href}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/40 hover:border-border transition-all duration-200 group text-center"
          >
            <span className="text-base font-extrabold tracking-wider text-foreground group-hover:text-primary transition-colors">
              {b.enName}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {b.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
