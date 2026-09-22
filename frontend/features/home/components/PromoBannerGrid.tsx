"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bannersApi } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";

const fallbackPromoBanners: Banner[] = [
  {
    id: 5,
    title: "Apple Ecosystem",
    subtitle: "iPhone 16 Pro, MacBook Pro M3 & Ultra 2",
    badge: "Special Cashback",
    link_url: "/products?category_id=1",
    cta_text: "Explore Apple",
    cta_link: "/products?category_id=1",
    image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    type: "promo",
    position: 0,
    is_active: true,
  },
  {
    id: 6,
    title: "Galaxy AI Era",
    subtitle: "Galaxy S24 Ultra with intelligent S Pen",
    badge: "Free Express",
    link_url: "/products?category_id=1",
    cta_text: "Shop Galaxy AI",
    cta_link: "/products?category_id=1",
    image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
    type: "promo",
    position: 1,
    is_active: true,
  },
  {
    id: 7,
    title: "Pro Gaming Battlestation",
    subtitle: "PlayStation 5 Pro & Keychron Wireless",
    badge: "Gold Warranty",
    link_url: "/products?category_id=5",
    cta_text: "Game On",
    cta_link: "/products?category_id=5",
    image_url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    type: "promo",
    position: 2,
    is_active: true,
  },
  {
    id: 8,
    title: "Studio Sound Experience",
    subtitle: "Sony & Bose active noise cancellation",
    badge: "Original Hi-Fi",
    link_url: "/products?category_id=3",
    cta_text: "Listen Now",
    cta_link: "/products?category_id=3",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    type: "promo",
    position: 3,
    is_active: true,
  },
];

const gradients = [
  "from-slate-900/90 to-zinc-900/40",
  "from-blue-950/90 to-indigo-950/40",
  "from-purple-950/90 to-violet-950/40",
  "from-emerald-950/90 to-teal-950/40",
];

export default function PromoBannerGrid() {
  const [promoBanners, setPromoBanners] = useState<Banner[]>(fallbackPromoBanners);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const live = await bannersApi.listActive("promo");
        if (live && live.length > 0) {
          setPromoBanners(live);
        }
      } catch (err) {
        console.warn("Using fallback promo banners", err);
      }
    };
    fetchPromos();
  }, []);

  return (
    <section className="w-full my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {promoBanners.slice(0, 4).map((item, idx) => {
          const gradient = gradients[idx % gradients.length];
          const targetUrl = item.link_url || item.cta_link || "/products";

          return (
            <Link
              key={item.id}
              href={targetUrl}
              className="group relative overflow-hidden rounded-2xl h-52 sm:h-56 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-5 text-white"
            >
              {/* Background Image */}
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${gradient} via-black/45 to-transparent`} />

              {/* Content */}
              <div className="relative z-10 space-y-1.5">
                {item.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-1 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-[11px] text-white/85 line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-white/95 group-hover:gap-2.5 transition-all">
                  <span>{item.cta_text || "Explore Collection"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
