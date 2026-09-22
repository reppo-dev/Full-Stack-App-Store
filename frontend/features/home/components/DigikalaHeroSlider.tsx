"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { bannersApi } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";

interface DigikalaHeroSliderProps {
  banners?: Banner[];
}

const accentGradients = [
  "from-slate-950 via-zinc-950 to-neutral-900",
  "from-blue-950 via-slate-950 to-indigo-950",
  "from-emerald-950 via-teal-950 to-slate-950",
  "from-purple-950 via-indigo-950 to-neutral-950",
];

export default function DigikalaHeroSlider({ banners = [] }: DigikalaHeroSliderProps) {
  const slides = banners.filter(b => b.type === 'hero').sort((a, b) => a.position - b.position);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const activeSlide = slides[current] || slides[0];
  const gradient = accentGradients[current % accentGradients.length];

  return (
    <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl my-3">
      <div className={`relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] w-full bg-gradient-to-r ${gradient} text-white transition-all duration-700`}>
        {/* Background Image with subtle gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src={activeSlide.image_url}
            alt={activeSlide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transition-opacity duration-700"
            unoptimized
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-1" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end sm:justify-center p-6 sm:p-10 md:p-16 space-y-4">
          <div className="flex items-center gap-2">
            {activeSlide.badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shadow-md uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {activeSlide.badge}
              </span>
            )}
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Featured Campaign
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
            {activeSlide.title}
          </h1>

          {activeSlide.subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-white/85 max-w-xl line-clamp-2 leading-relaxed">
              {activeSlide.subtitle}
            </p>
          )}

          <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href={activeSlide.cta_link || activeSlide.link_url || "/products"}>
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-7 h-12 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 group"
              >
                {activeSlide.cta_text || "Shop Now"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href={activeSlide.link_url || "/products"}>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-12 rounded-xl backdrop-blur-md font-semibold px-6"
              >
                Explore Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-red-600" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
