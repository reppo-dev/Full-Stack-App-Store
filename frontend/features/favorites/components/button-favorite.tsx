"use client";

import React, { useEffect, useState, useTransition } from "react";
import { favoritesApi } from "@/features/favorites/api/favorites.client";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
  onToggle?: (isFav: boolean) => void;
}

export default function FavoriteButton({
  productId,
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    favoritesApi
      .check(productId)
      .then((isFav) => {
        if (isMounted) {
          setFavorite(isFav);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFavorite(false);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending || isLoading) return;

    const previousState = favorite;
    const nextState = !previousState;
    setFavorite(nextState);

    startTransition(async () => {
      try {
        if (previousState) {
          await favoritesApi.remove(productId);
          onToggle?.(false);
          toast.success("Removed from wishlist");
        } else {
          await favoritesApi.add(productId);
          onToggle?.(true);
          toast.success("Added to wishlist");
        }
      } catch (err) {
        // If 409 conflict on add, it's already a favorite
        if ((err as { statusCode?: number })?.statusCode === 409) {
          setFavorite(true);
          onToggle?.(true);
          return;
        }
        // If 404 on remove, it's already removed
        if ((err as { statusCode?: number })?.statusCode === 404 && previousState) {
          setFavorite(false);
          onToggle?.(false);
          return;
        }

        // Revert on unexpected failure
        setFavorite(previousState);
        onToggle?.(previousState);

        const status = (err as { statusCode?: number; status?: number })?.statusCode || (err as { status?: number })?.status;
        const msg = (err as Error)?.message?.toLowerCase() || "";
        if (status === 401 || msg.includes("unauthorized") || msg.includes("auth")) {
          toast.error("Please sign in to add items to your wishlist", {
            action: {
              label: "Sign In",
              onClick: () => {
                window.location.href = "/login";
              },
            },
          });
        } else {
          toast.error((err as Error)?.message || "Failed to update wishlist");
        }
      }
    });
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isPending || isLoading}
      className={`p-2 rounded-full hover:bg-muted/80 active:scale-95 transition-all duration-150 flex items-center justify-center ${className}`}
      aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
      ) : favorite ? (
        <Heart className="w-5 h-5 fill-rose-500 text-rose-500 transition-transform duration-150 scale-110" />
      ) : (
        <Heart className="w-5 h-5 text-muted-foreground hover:text-rose-500 transition-colors" />
      )}
    </button>
  );
}
