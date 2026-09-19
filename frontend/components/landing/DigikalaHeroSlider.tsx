"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  accentBg: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    title: "آیفون ۱۶ پرو مکس؛ اوج نوآوری اپل",
    subtitle: "بدنه تیتانیوم ارگونومیک، تراشه A18 Pro و سیستم دوربین پیشرفته ۴۸ مگاپیکسلی با زوم ۵ برابری",
    badge: "جدیدترین پرچمدار",
    ctaText: "مشاهده و خرید",
    ctaLink: "/products/apple-iphone-16-pro-max-256gb",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
    accentBg: "from-slate-900 via-zinc-900 to-stone-900",
  },
  {
    id: 2,
    title: "مک‌بوک پرو ۱۶ اینچ با تراشه M3 Max",
    subtitle: "قدرت فوق‌العاده برای رندرهای سنگین و هوش مصنوعی با نمایشگر Liquid Retina XDR و ۲۲ ساعت باتری",
    badge: "انتخاب حرفه‌ای‌ها",
    ctaText: "بررسی مشخصات",
    ctaLink: "/products/macbook-pro-16-inch-m3-max",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    accentBg: "from-blue-950 via-slate-900 to-indigo-950",
  },
  {
    id: 3,
    title: "جشنواره هدفون و تجهیزات صوتی پریمیوم",
    subtitle: "سکوت مطلق با برترین هدفون‌های نویزکنسلینگ سونی WH-1000XM5 و بوز QuietComfort Ultra",
    badge: "تا ۲۰٪ تخفیف شگفت‌انگیز",
    ctaText: "مشاهده جشنواره",
    ctaLink: "/products?category_id=3",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    accentBg: "from-emerald-950 via-teal-950 to-slate-900",
  },
  {
    id: 4,
    title: "پلی‌استیشن ۵ پرو؛ انقلاب نسل نهم",
    subtitle: "وضوح فوق‌العاده 4K با هوش مصنوعی PSSR، حافظه پرسرعت ۲ ترابایتی و نرخ فریم پایدار ۱۲۰ هرتز",
    badge: "ویژه گیمرها",
    ctaText: "خرید فوری",
    ctaLink: "/products/sony-playstation-5-pro-console",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
    accentBg: "from-purple-950 via-indigo-950 to-neutral-900",
  },
];

export default function DigikalaHeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[current];

  return (
    <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-lg my-3">
      <div className={`relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] w-full bg-gradient-to-r ${activeSlide.accentBg} text-white transition-all duration-700`}>
        {/* Background Image with subtle gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <Image
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-1" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end sm:justify-center p-6 sm:p-10 md:p-16 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-semibold text-xs shadow-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              {activeSlide.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
            {activeSlide.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-xl line-clamp-2 leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="pt-2 flex items-center gap-4">
            <Link href={activeSlide.ctaLink}>
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-11 rounded-xl shadow-md transition-all hover:scale-105"
              >
                {activeSlide.ctaText}
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-11 rounded-xl backdrop-blur-xs"
              >
                مشاهده همه محصولات
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-7 bg-red-600" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
