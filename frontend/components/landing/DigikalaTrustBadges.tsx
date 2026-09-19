"use client";

import React from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones, CreditCard } from "lucide-react";

interface TrustItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const trustItems: TrustItem[] = [
  {
    title: "امکان تحویل اکسپرس",
    description: "تحویل سفارشات در سریع‌ترین زمان ممکن",
    icon: Truck,
  },
  {
    title: "۷ روز ضمانت بازگشت کالا",
    description: "امکان مرجوعی بدون قید و شرط تا ۷ روز",
    icon: RotateCcw,
  },
  {
    title: "ضمانت اصالت کالا",
    description: "تضمین ۱۰۰٪ اصالت فیزیکی و دیجیتال",
    icon: ShieldCheck,
  },
  {
    title: "پشتیبانی ۲۴ ساعته",
    description: "پاسخگویی سریع در تمامی روزهای هفته",
    icon: Headphones,
  },
  {
    title: "پرداخت امن و مطمئن",
    description: "درگاه معتبر شاپرکی با بالاترین استانداردها",
    icon: CreditCard,
  },
];

export default function DigikalaTrustBadges() {
  return (
    <section className="w-full my-10 py-6 border-y border-border/60">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-2 p-3 rounded-2xl hover:bg-muted/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                {item.title}
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
