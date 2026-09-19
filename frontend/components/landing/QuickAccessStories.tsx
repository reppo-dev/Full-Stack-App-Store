"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Tag,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Gift,
} from "lucide-react";

interface StoryItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
}

const stories: StoryItem[] = [
  {
    id: "jet",
    title: "ارسال امروز",
    href: "/products",
    icon: Zap,
    gradient: "from-amber-400 to-orange-500",
    badge: "فوری",
  },
  {
    id: "incredible",
    title: "شگفت‌انگیزها",
    href: "#incredible-offers",
    icon: Tag,
    gradient: "from-rose-500 to-red-600",
    badge: "ویژه",
  },
  {
    id: "mobiles",
    title: "موبایل و تبلت",
    href: "/products?category_id=1",
    icon: Smartphone,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "laptops",
    title: "لپ‌تاپ و کامپیوتر",
    href: "/products?category_id=2",
    icon: Laptop,
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "audio",
    title: "صوتی و هدفون",
    href: "/products?category_id=3",
    icon: Headphones,
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    id: "wearables",
    title: "ساعت هوشمند",
    href: "/products?category_id=4",
    icon: Watch,
    gradient: "from-sky-400 to-cyan-600",
  },
  {
    id: "gaming",
    title: "کنسول و گیمینگ",
    href: "/products?category_id=5",
    icon: Gamepad2,
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "deals",
    title: "حراج و تخفیف‌ها",
    href: "/products",
    icon: Gift,
    gradient: "from-yellow-400 to-amber-600",
  },
];

export default function QuickAccessStories() {
  return (
    <section className="w-full py-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 min-w-max px-4">
        {stories.map((story) => {
          const Icon = story.icon;
          return (
            <Link
              key={story.id}
              href={story.href}
              className="flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1"
            >
              <div className="relative">
                {/* Gradient Ring Outer Border */}
                <div
                  className={`p-0.5 rounded-full bg-gradient-to-tr ${story.gradient} shadow-xs group-hover:shadow-md transition-shadow`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card p-1 flex items-center justify-center">
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-tr ${story.gradient} flex items-center justify-center text-white`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
                    </div>
                  </div>
                </div>

                {story.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-background">
                    {story.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] sm:text-xs font-medium text-foreground/85 group-hover:text-primary transition-colors text-center">
                {story.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
