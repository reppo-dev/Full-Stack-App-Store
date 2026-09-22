"use client";

import { useEffect, useState } from "react";
import BannerProduct from '@/features/banners/components/DashboardBanner';
import CardProduct from '@/features/products/components/DashboardProductCard';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sliders } from "lucide-react";
import { productsApi } from "@/features/products/api/products.client";
import { favoritesApi } from "@/features/favorites/api/favorites.client";
import { Product } from "@/models/modles";

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.list();
        setProducts(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await favoritesApi.list();
        const ids = res.map((fav) => fav.product_id);
        setFavoriteIds(new Set(ids));
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (productId: number) => {
    const isFav = favoriteIds.has(productId);

    try {
      if (isFav) {
        await favoritesApi.remove(productId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await favoritesApi.add(productId);
        setFavoriteIds((prev) => new Set(prev).add(productId));
      }
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mx-7 my-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products & Catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse inventory, toggle favorites, and manage promotional campaigns
          </p>
        </div>
        <Link href="/dashboard/banners">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-blue-600/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold"
          >
            <Sliders className="h-4 w-4" />
            Manage Banners & CTAs
          </Button>
        </Link>
      </div>
      <div className="mx-5">
        <BannerProduct />
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mx-6 my-10">
        {products.map((p) => (
          <CardProduct
            key={p.ID}
            props={p}
            isFavorite={favoriteIds.has(Number(p.ID))}
            onToggleFavorite={() => toggleFavorite(Number(p.ID))}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
