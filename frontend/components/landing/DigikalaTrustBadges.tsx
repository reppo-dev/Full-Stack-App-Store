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
    title: "Express Delivery",
    description: "Superfast doorstep dispatch on all orders",
    icon: Truck,
  },
  {
    title: "7 Days Easy Returns",
    description: "Hassle-free 100% money back guarantee",
    icon: RotateCcw,
  },
  {
    title: "Authenticity Guaranteed",
    description: "Genuine physical & digital tech guaranteed",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Dedicated Support",
    description: "Expert assistance anytime around the clock",
    icon: Headphones,
  },
  {
    title: "Secure Checkout",
    description: "256-bit SSL encrypted bank-grade payments",
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
