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
import { Sliders, ArrowRight, ExternalLink } from "lucide-react";

export default function BannerProduct() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await bannersApi.listActive("hero");
        setBanners(data);
      } catch (err) {
        console.error("Failed to load hero banners for dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  return (
    <div className="mx-2 relative group">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Storefront Campaign Banners
          </span>
        </div>
        <Link href="/dashboard/banners">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-blue-600/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Sliders className="h-3.5 w-3.5" />
            Manage & Edit Banners
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl bg-muted animate-pulse flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading campaign banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center shadow-lg">
          <h2 className="text-2xl font-bold">No Active Storefront Banners</h2>
          <p className="text-sm text-blue-100 mt-2">
            Create promotional banners to showcase your products on the home storefront.
          </p>
          <Link href="/dashboard/banners">
            <Button className="mt-5 bg-white text-blue-600 hover:bg-blue-50 font-bold">
              <Sliders className="h-4 w-4 mr-2" />
              Configure Banners
            </Button>
          </Link>
        </div>
      ) : (
        <Carousel className="w-full max-w-7xl mx-auto">
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative rounded-3xl overflow-hidden min-h-[260px] md:min-h-[300px] flex items-center p-8 md:p-12 shadow-lg bg-slate-950">
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
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 max-w-xl space-y-4 text-white">
                    {banner.badge && (
                      <Badge className="bg-blue-600 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider">
                        {banner.badge}
                      </Badge>
                    )}

                    <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                      {banner.title}
                    </h2>

                    {banner.subtitle && (
                      <p className="text-sm md:text-base text-slate-200/90 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link href={banner.cta_link || banner.link_url || "/product"}>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-md flex items-center gap-2">
                          {banner.cta_text || "Shop Now"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href="/dashboard/banners">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs backdrop-blur-md"
                        >
                          <Sliders className="h-3.5 w-3.5 mr-1.5" />
                          Edit Banner Destination
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
      )}
    </div>
  );
}
