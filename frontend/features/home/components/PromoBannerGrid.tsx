"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bannersApi } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";

interface PromoBannerGridProps {
  banners?: Banner[];
}

const gradients = [
  "from-slate-900/90 to-zinc-900/40",
  "from-blue-950/90 to-indigo-950/40",
  "from-purple-950/90 to-violet-950/40",
  "from-emerald-950/90 to-teal-950/40",
];

export default function PromoBannerGrid({ banners = [] }: PromoBannerGridProps) {
  const promoBanners = banners.filter(b => b.type === 'promo').sort((a, b) => a.position - b.position);

  if (promoBanners.length === 0) return null;

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
