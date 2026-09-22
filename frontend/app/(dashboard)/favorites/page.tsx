"use client";

import { useEffect, useState } from "react";
import CardProduct from '@/features/products/components/DashboardProductCard';
import { favoritesApi, FavoriteItem } from '@/features/favorites/api/favorites.client';
import { Product } from "@/models/modles";

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoritesApi.list();
        setFavorites(data);
        const ids = data.map((fav) => fav.product_id);
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
        setFavorites((prev) =>
          prev.filter((fav) => fav.product_id !== productId),
        );
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await favoritesApi.add(productId);
        // Note: For adding on this page, it might be out of sync if we don't refetch,
        // but typically you wouldn't "add" from the favorites list page. 
        // Just in case, update state locally:
        setFavoriteIds((prev) => new Set(prev).add(productId));
      }
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  return (
    <div>
      <p className="text-2xl ml-7 my-8">Favorites</p>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mx-6 my-10">
        {favorites.map((fav) => (
          <CardProduct
            key={fav.Product.ID}
            props={fav.Product as unknown as Product}
            isFavorite={true}
            onToggleFavorite={() => toggleFavorite(fav.product_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
