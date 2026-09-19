"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { bannersApi } from "@/lib/api/banners";
import { Banner } from "@/models/modles";

const fallbackSlides: Banner[] = [
  {
    id: 1,
    title: "Apple iPhone 16 Pro Max",
    subtitle: "Aerospace-grade titanium, breakthrough A18 Pro chip, and pro camera system with 5x optical telephoto.",
    badge: "Flagship Launch",
    cta_text: "Shop iPhone 16 Pro",
    cta_link: "/products/apple-iphone-16-pro-max-256gb",
    link_url: "/products/apple-iphone-16-pro-max-256gb",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
    type: "hero",
    position: 0,
    is_active: true,
  },
  {
    id: 2,
    title: "MacBook Pro 16-inch M3 Max",
    subtitle: "Astronomical performance for 3D rendering and machine learning with Liquid Retina XDR and up to 22h battery.",
    badge: "Pro Choice",
    cta_text: "Explore MacBook",
    cta_link: "/products/macbook-pro-16-inch-m3-max",
    link_url: "/products/macbook-pro-16-inch-m3-max",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    type: "hero",
    position: 1,
    is_active: true,
  },
  {
    id: 3,
    title: "Premium Hi-Fi Audio Festival",
    subtitle: "Immersive acoustic perfection with Sony WH-1000XM5 and Bose QuietComfort Ultra noise-canceling headphones.",
    badge: "Up to 25% OFF",
    cta_text: "Discover Audio",
    cta_link: "/products?category_id=3",
    link_url: "/products?category_id=3",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    type: "hero",
    position: 2,
    is_active: true,
  },
  {
    id: 4,
    title: "PlayStation 5 Pro & Elite Gaming",
    subtitle: "Ultra-high-definition 4K 120Hz gaming, PlayStation Spectral Super Resolution (PSSR), and lightning-fast 2TB SSD.",
    badge: "Next-Gen Gaming",
    cta_text: "Order PS5 Pro",
    cta_link: "/products/sony-playstation-5-pro-console",
    link_url: "/products/sony-playstation-5-pro-console",
    image_url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
    type: "hero",
    position: 3,
    is_active: true,
  },
];

const accentGradients = [
  "from-slate-950 via-zinc-950 to-neutral-900",
  "from-blue-950 via-slate-950 to-indigo-950",
  "from-emerald-950 via-teal-950 to-slate-950",
  "from-purple-950 via-indigo-950 to-neutral-950",
];

export default function DigikalaHeroSlider() {
  const [slides, setSlides] = useState<Banner[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const liveBanners = await bannersApi.listActive("hero");
        if (liveBanners && liveBanners.length > 0) {
          setSlides(liveBanners);
        }
      } catch (err) {
        console.warn("Using fallback hero banners due to API error", err);
      }
    };
    fetchHeroBanners();
  }, []);

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
