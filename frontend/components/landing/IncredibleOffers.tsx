"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/models/modles";
import { ChevronLeft, ChevronRight, Flame, Sparkles, ArrowRight } from "lucide-react";

interface IncredibleOffersProps {
  products: Product[];
}

export default function IncredibleOffers({ products }: IncredibleOffersProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 35,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Products with simulated discount percentages for visual fidelity
  const deals = products.map((p, idx) => {
    const discounts = [15, 20, 10, 25, 12, 18, 30];
    const discountPercent = discounts[idx % discounts.length];
    const originalPrice = (p.price * (100 + discountPercent)) / 100;
    const stockLeft = ((p.stock || 15) % 8) + 2;

    return {
      ...p,
      discountPercent,
      originalPrice,
      stockLeft,
    };
  });

  return (
    <section id="incredible-offers" className="w-full my-6">
      <div className="bg-gradient-to-r from-[#ef4056] via-[#e6123d] to-[#d60e36] rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch gap-4 relative z-10">
          {/* Header Card (Signature Incredible Box) */}
          <div className="flex lg:flex-col justify-between items-center lg:items-center text-white lg:w-48 shrink-0 p-2 lg:p-4 text-center">
            <div className="flex flex-col items-start lg:items-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-1 shadow-inner">
                <Flame className="w-7 h-7 text-amber-300 animate-bounce" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                Incredible
                <br className="hidden lg:block" />
                Offers
              </h2>
              <span className="text-[11px] text-white/90 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Limited Time
              </span>
            </div>

            {/* Countdown Box */}
            <div className="flex flex-col items-end lg:items-center space-y-2 mt-3">
              <div className="flex items-center gap-1 font-mono text-sm font-extrabold">
                <span className="bg-white/20 px-2 py-1 rounded-md min-w-[28px] text-center shadow-xs">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded-md min-w-[28px] text-center shadow-xs">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded-md min-w-[28px] text-center shadow-xs">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>

              <Link
                href="/products"
                className="text-xs font-bold text-white hover:text-amber-200 transition-colors flex items-center gap-1 group pt-1"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Scrolling Products Carousel */}
          <div className="relative flex-1 min-w-0">
            <div
              ref={scrollRef}
              className="flex items-stretch gap-3 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
            >
              {deals.map((item) => {
                const img =
                  Array.isArray(item.images) && item.images.length > 0
                    ? item.images[0]
                    : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80";

                return (
                  <Link
                    key={item.id ?? item.ID}
                    href={`/products/${item.slug || item.id || item.ID}`}
                    className="bg-card text-card-foreground rounded-xl p-3 sm:p-4 w-[190px] sm:w-[210px] shrink-0 flex flex-col justify-between hover:shadow-xl transition-all duration-200 group border border-border/40"
                  >
                    {/* Image & Discount Badge */}
                    <div className="relative w-full aspect-square mb-2 bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={img}
                        alt={item.title}
                        fill
                        sizes="210px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <span className="absolute top-2 right-2 bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                        {item.discountPercent}% OFF
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 h-8 leading-snug mb-2 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Price & Stock info */}
                    <div className="space-y-1.5 pt-1 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground line-through">
                          ${item.originalPrice.toFixed(0)}
                        </span>
                        <span className="text-sm font-extrabold text-foreground">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Stock Bar */}
                      <div className="space-y-0.5">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(20, (item.stockLeft / 10) * 100))}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Only {item.stockLeft} left in stock
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* End Card */}
              <Link
                href="/products"
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-4 w-[140px] shrink-0 flex flex-col items-center justify-center text-center gap-3 backdrop-blur-md transition-colors border border-white/20 group"
              >
                <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold leading-tight">View All Incredible Offers</span>
              </Link>
            </div>

            {/* Scroll Navigation Arrows */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card text-foreground shadow-md flex items-center justify-center hover:bg-accent transition-all hidden sm:flex border border-border"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card text-foreground shadow-md flex items-center justify-center hover:bg-accent transition-all hidden sm:flex border border-border"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
