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
import { uiApi, Brand, Story } from "@/features/ui/api/ui.client";
import { bannersApi } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";
import { categoriesApi } from "@/features/categories/api/categories.client";

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

  let brands: Brand[] = [];
  let stories: Story[] = [];
  let banners: Banner[] = [];
  let categories: any[] = [];

  try {
    const [brandsRes, storiesRes, bannersRes, categoriesRes] = await Promise.all([
      uiApi.getBrands(),
      uiApi.getStories(),
      bannersApi.listActive(),
      categoriesApi.getTree()
    ]);
    if (brandsRes?.success) brands = brandsRes.data;
    if (storiesRes?.success) stories = storiesRes.data;
    if (bannersRes && Array.isArray(bannersRes)) banners = bannersRes;
    if (categoriesRes && Array.isArray(categoriesRes)) categories = categoriesRes;
  } catch (err) {
    console.error("Failed to load dynamic UI data:", err);
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground selection:bg-red-500 selection:text-white">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pb-12">
        {/* 1. Quick Access Circular Stories */}
        <QuickAccessStories stories={stories} />

        {/* 2. Main Hero Promotional Slider */}
        <DigikalaHeroSlider banners={banners} />

        {/* 3. The Iconic "Incredible Offers" (Flash Deals Carousel) */}
        <IncredibleOffers products={productList} />

        {/* 4. Promotional 4-Banner Grid */}
        <PromoBannerGrid banners={banners} />

        {/* 5. Shop by Department / Category Grid */}
        <CategoryExplorer categories={categories} />

        {/* 6. Best Sellers & Popular Products */}
        <BestSellersSection products={productList} />

        {/* 7. Top Brands Showcase */}
        <BrandShowcase brands={brands} />

        {/* 8. Digikala Trust & Guarantees */}
        <DigikalaTrustBadges />
      </div>
    </div>
  );
}
