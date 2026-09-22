"use server";

import { revalidatePath } from "next/cache";
import { favoritesApi } from "@/features/favorites/api/favorites.client";
import GetIdUser from '@/features/auth/api/GetIdUser';

/**
 * Get all favorites for the current user via V1 API.
 */
export const getUserFavorites = async () => {
  try {
    const favorites = await favoritesApi.list();
    return { success: true, data: favorites };
  } catch (error) {
    console.error("Get favorites error:", error);
    return {
      success: false,
      error: "There was a problem retrieving the wishlist",
    };
  }
};

/**
 * Add a product to the current user's favorites via V1 API.
 */
export async function addToFavorites(productId: number) {
  try {
    await favoritesApi.add(productId);
    revalidatePath("/favorites");
    revalidatePath("/favorite");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 409 || (error as Error)?.message?.includes("already")) {
      return {
        success: false,
        error: "This product has already been added to favorites",
      };
    }
    return { success: false, error: "Error adding to favorites" };
  }
}

/**
 * Remove a product from the current user's favorites via V1 API.
 */
export async function removeFromFavorites(productId: number) {
  try {
    await favoritesApi.remove(productId);
    revalidatePath("/favorites");
    revalidatePath("/favorite");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 404) {
      return { success: false, error: "Favorite not found" };
    }
    return { success: false, error: "Error removing favorite" };
  }
}

/**
 * Check if a product is in the current user's favorites.
 */
export async function isFavorite(productId: number): Promise<boolean> {
  try {
    return await favoritesApi.check(productId);
  } catch {
    return false;
  }
}
