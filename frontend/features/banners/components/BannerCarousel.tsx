"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bannersApi } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function BannerCarousel({ className }: { className?: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await bannersApi.listActive("hero");
        setBanners(data);
      } catch (err) {
        console.error("Failed to load hero banners for catalog", err);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  if (loading) {
    return (
      <div className={`h-56 sm:h-64 rounded-3xl bg-muted animate-pulse flex items-center justify-center ${className || "md:mx-0"}`}>
        <p className="text-sm text-muted-foreground">Loading campaigns...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className={className || "md:mx-0"}>
      <Carousel className="w-full max-w-7xl mx-auto">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative rounded-3xl overflow-hidden min-h-[240px] md:min-h-[280px] flex items-center p-8 md:p-12 shadow-lg bg-slate-950">
                {/* Background Image */}
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover opacity-35"
                  sizes="100vw"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />

                {/* Content */}
                <div className="relative z-10 max-w-xl space-y-3 text-white">
                  {banner.badge && (
                    <Badge className="bg-red-600 text-white font-bold text-[11px] px-2.5 py-0.5 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {banner.badge}
                    </Badge>
                  )}

                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                    {banner.title}
                  </h2>

                  {banner.subtitle && (
                    <p className="text-xs md:text-sm text-slate-200/90 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="pt-2">
                    <Link href={banner.cta_link || banner.link_url || "/products"}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-10 rounded-xl shadow-md flex items-center gap-2 group">
                        {banner.cta_text || "Shop Now"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 bg-black/40 hover:bg-black/70 text-white border-white/20 rounded-full h-10 w-10" />
        <CarouselNext className="right-4 bg-black/40 hover:bg-black/70 text-white border-white/20 rounded-full h-10 w-10" />
      </Carousel>
    </div>
  );
}
