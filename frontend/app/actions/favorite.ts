"use server";

import { revalidatePath } from "next/cache";
import axios, { AxiosError } from "axios";
import { Favorite } from "@/models/modles";
import GetIdUser from "./GetIdUser";
import getToken from "./getToken";

export const getUserFavorites = async () => {
  try {
    const user = await GetIdUser();
    const token = await getToken();
    const response = await axios.get<Favorite[]>(
      `http://localhost:8000/api/favorites/${user.ID}`,
      {
        headers: {
          Cookie: `jwt=${token}`,
        },
      },
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get favorites error:", error);
    return {
      success: false,
      error: "There was a problem retrieving the wishlist",
    };
  }
};

// Add to favorites
export async function addToFavorites(productId: number) {
  try {
    const user = await GetIdUser();
    const token = await getToken();
    const response = await axios.post<Favorite>(
      "http://localhost:8000/api/favorites",
      {
        user_id: user.ID,
        product_id: productId,
      },
      {
        headers: {
          Cookie: `jwt=${token}`,
        },
      },
    );
    revalidatePath("/favorites");
    revalidatePath(`/products/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosErr = error as AxiosError;
    if (axiosErr.response?.status === 409) {
      return {
        success: false,
        error: "This product has already been added to favorites",
      };
    }
    return { success: false, error: "adding to favorites" };
  }
}

// Remove from favorites
export async function removeFromFavorites(productId: number) {
  try {
    const user = await GetIdUser();
    const token = await getToken();
    await axios.delete("http://localhost:8000/api/favorites", {
      headers: {
        Cookie: `jwt=${token}`,
      },
      data: { user_id: user.ID, product_id: productId },
    });
    revalidatePath("/favorites");
    revalidatePath(`/product/${productId}`);
    return { success: true };
  } catch (error) {
    const axiosErr = error as AxiosError;
    if (axiosErr.response?.status === 404) {
      return {
        success: false,
        error: "This product was not found in the wishlist",
      };
    }
    return { success: false, error: "Error removing from favorites" };
  }
}

export async function isFavorite(productId: number): Promise<boolean> {
  const result = await getUserFavorites();
  if (!result.success) return false;
  return result.data!.some((fav) => fav.ProductID === productId);
}
