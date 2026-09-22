import React from "react";
import { getProducts } from "@/features/products/api/product.action";
import { productsApi } from "@/features/products/api/products.client";
import { Product } from "@/models/modles";

import QuickAccessStories from "@/features/home/components/QuickAccessStories";
import DigikalaHeroSlider from "@/features/home/components/DigikalaHeroSlider";
import IncredibleOffers from "@/features/home/components/IncredibleOffers";
import PromoBannerGrid from "@/features/home/components/PromoBannerGrid";
import CategoryExplorer from "@/features/home/components/CategoryExplorer";
import BestSellersSection from "@/features/home/components/BestSellersSection";
import BrandShowcase from "@/features/home/components/BrandShowcase";
import DigikalaTrustBadges from "@/features/home/components/DigikalaTrustBadges";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let productList: Product[] = [];

  try {
    const res = await getProducts();
    if (res?.success && Array.isArray(res.product)) {
      productList = res.product;
    }
  } catch (err) {
    console.error("Failed to load products for landing page:", err);
  }

  // If server action returned empty or failed, fallback to direct API list
  if (productList.length === 0) {
    try {
      const res = await productsApi.list({ limit: 30 });
      productList = res.data || [];
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground selection:bg-red-500 selection:text-white">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-12">
        {/* 1. Quick Access Circular Stories */}
        <QuickAccessStories />

        {/* 2. Main Hero Promotional Slider */}
        <DigikalaHeroSlider />

        {/* 3. The Iconic "Incredible Offers" (Flash Deals Carousel) */}
        <IncredibleOffers products={productList} />

        {/* 4. Promotional 4-Banner Grid */}
        <PromoBannerGrid />

        {/* 5. Shop by Department / Category Grid */}
        <CategoryExplorer />

        {/* 6. Best Sellers & Popular Products */}
        <BestSellersSection products={productList} />

        {/* 7. Top Brands Showcase */}
        <BrandShowcase />

        {/* 8. Digikala Trust & Value Badges */}
        <DigikalaTrustBadges />
      </div>
    </div>
  );
}
