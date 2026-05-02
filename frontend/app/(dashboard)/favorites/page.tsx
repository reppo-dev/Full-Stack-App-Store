"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import CardProduct from "../components/product/cardProduct";
import GetIdUser from "../components/GetIdUser";

type ProductType = {
  ID: string;
  title: string;
  price: number;
  rating: number;
  images: string[];
};

interface FavoriteItem {
  ID: number;
  product_id: number;
  Product: ProductType;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await GetIdUser();
      if (user) setUserId(user.ID);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/favorites/${userId}`,
        );
        const data: FavoriteItem[] = res.data;
        setFavorites(data);
        const ids = data.map((fav) => fav.product_id);
        setFavoriteIds(new Set(ids));
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (productId: number) => {
    if (!userId) return;
    const isFav = favoriteIds.has(productId);

    try {
      if (isFav) {
        await axios.delete("http://localhost:3000/api/favorites", {
          data: { user_id: userId, product_id: productId },
        });
        setFavorites((prev) =>
          prev.filter((fav) => fav.product_id !== productId),
        );
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await axios.post("http://localhost:3000/api/favorites", {
          user_id: userId,
          product_id: productId,
        });
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
            props={fav.Product}
            isFavorite={true}
            onToggleFavorite={() => toggleFavorite(fav.product_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
