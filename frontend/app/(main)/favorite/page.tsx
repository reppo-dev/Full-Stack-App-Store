"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { favoritesApi, FavoriteItem } from "@/lib/api/favorites";
import { useAppDispatch } from "@/lib/redux/store";
import { addToCart, openCart } from "@/lib/redux/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Package,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await favoritesApi.list();
      setFavorites(data);
    } catch (err: any) {
      console.error("Failed to load favorites:", err);
      setError(
        err.message || "Failed to load your wishlist. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (productId: number, title: string) => {
    try {
      await favoritesApi.remove(productId);
      setFavorites((prev) =>
        prev.filter(
          (fav) => fav.product_id !== productId && fav.ProductID !== productId
        )
      );
      toast.success(`Removed "${title}" from wishlist`);
    } catch (err: any) {
      console.error("Remove failed:", err);
      toast.error(err.message || "Failed to remove item");
    }
  };

  const handleAddToCart = (item: FavoriteItem) => {
    const prod = item.product || item.Product;
    const prodId = prod.id ?? prod.ID ?? item.product_id;
    const img =
      Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : "";

    dispatch(
      addToCart({
        id: prodId,
        title: prod.title,
        price: prod.price,
        image: img,
        stock: prod.stock ?? 999,
        quantity: 1,
      })
    );
    dispatch(openCart());
    toast.success(`Added "${prod.title}" to cart`);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Items you have saved to purchase later.
          </p>
        </div>
        {!isLoading && favorites.length > 0 && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 self-start sm:self-auto">
            {favorites.length} {favorites.length === 1 ? "saved item" : "saved items"}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-4 space-y-4 shadow-sm"
            >
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center max-w-md mx-auto my-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Could not load wishlist
          </h3>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchFavorites} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && favorites.length === 0 && (
        <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-16 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6 text-rose-500">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Explore our curated catalog and tap the heart icon on any product to save it here.
          </p>
          <Button asChild size="lg" className="gap-2 shadow-md">
            <Link href="/products">
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Wishlist Grid */}
      {!isLoading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            const prod = fav.product || fav.Product || {};
            const prodId = prod.id ?? prod.ID ?? fav.product_id;
            const primaryImg =
              Array.isArray(prod.images) && prod.images.length > 0
                ? prod.images[0]
                : "";

            return (
              <div
                key={fav.id || fav.ID}
                className="group relative rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Floating Actions */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/40 border mb-4">
                    {primaryImg &&
                    (primaryImg.startsWith("http") || primaryImg.startsWith("/")) ? (
                      <Image
                        src={primaryImg}
                        alt={prod.title || "Product"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-12 h-12 stroke-1" />
                      </div>
                    )}

                    {/* Delete from favorites button */}
                    <button
                      onClick={() => handleRemove(prodId, prod.title)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-rose-500 hover:bg-background transition shadow-sm"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Price */}
                  <Link
                    href={`/products/${prod.slug || prodId}`}
                    className="block group-hover:text-red-600 transition"
                  >
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                      {prod.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-1 mb-3">
                    <span className="text-base font-extrabold text-foreground">
                      ${Number(prod.price ?? 0).toFixed(2)}
                    </span>
                    {prod.stock !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.stock > 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Button
                    onClick={() => handleAddToCart(fav)}
                    disabled={prod.stock === 0}
                    className="w-full gap-2 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-9 shadow-xs"
                    size="sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                  >
                    <Link href={`/products/${prod.slug || prodId}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
