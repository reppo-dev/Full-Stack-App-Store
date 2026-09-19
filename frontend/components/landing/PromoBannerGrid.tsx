"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  link: string;
  imageUrl: string;
  gradient: string;
}

const banners: BannerItem[] = [
  {
    id: 1,
    title: "اکوسیستم بی‌نقص اپل",
    subtitle: "آیفون ۱۶ پرو مکس، مک‌بوک پرو و اپل واچ اولترا",
    tag: "تخفیف نقدی ویژه",
    link: "/products?category_id=1",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    gradient: "from-slate-900/90 to-zinc-900/40",
  },
  {
    id: 2,
    title: "نسل نوین هوش مصنوعی",
    subtitle: "سامسونگ Galaxy S24 Ultra با پردازش هوشمند و قلم S Pen",
    tag: "ارسال رایگان اکسپرس",
    link: "/products?category_id=1",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
    gradient: "from-blue-950/90 to-indigo-950/40",
  },
  {
    id: 3,
    title: "دنیای گیمینگ حرفه‌ای",
    subtitle: "پلی‌استیشن ۵ پرو و کیبوردهای مکانیکی Keychron",
    tag: "گارانتی طلایی تعویض",
    link: "/products?category_id=5",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    gradient: "from-purple-950/90 to-violet-950/40",
  },
  {
    id: 4,
    title: "صدای تفکیک‌شده و نویزکنسلینگ",
    subtitle: "سونی و بوز؛ غرق در جزئیات موسیقی با کیفیت استودیویی",
    tag: "تضمین اصالت کالا",
    link: "/products?category_id=3",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-950/90 to-teal-950/40",
  },
];

export default function PromoBannerGrid() {
  return (
    <section className="w-full my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {banners.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group relative overflow-hidden rounded-2xl h-52 sm:h-56 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-end p-5 text-white"
          >
            {/* Background Image */}
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} via-black/40 to-transparent`} />

            {/* Content */}
            <div className="relative z-10 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-semibold text-white mb-1">
                {item.tag}
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-white/80 line-clamp-1">
                {item.subtitle}
              </p>
              <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:gap-2 transition-all">
                <span>مشاهده محصولات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
