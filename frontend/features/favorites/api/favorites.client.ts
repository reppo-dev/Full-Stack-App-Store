import { apiClient } from '@/lib/api/client';
import { Product } from "@/models/modles";
import { normalizeProduct, RawProduct } from '@/features/products/api/products.client';

export interface FavoriteItem {
  id: number;
  ID: number;
  user_id: number;
  UserID: number;
  product_id: number;
  ProductID: number;
  product: Product;
  Product: Product;
  created_at?: string;
}

export interface RawFavorite {
  id?: number | string;
  ID?: number | string;
  user_id?: number | string;
  UserID?: number | string;
  product_id?: number | string;
  ProductID?: number | string;
  product?: RawProduct;
  Product?: RawProduct;
  created_at?: string;
  CreatedAt?: string;
  [key: string]: unknown;
}

export function normalizeFavorite(raw: RawFavorite | null | undefined): FavoriteItem {
  if (!raw) return raw as unknown as FavoriteItem;
  const id = Number(raw.id ?? raw.ID ?? 0);
  const userId = Number(raw.user_id ?? raw.UserID ?? 0);
  const productId = Number(raw.product_id ?? raw.ProductID ?? (raw.product?.id ?? raw.Product?.ID ?? 0));
  const normalizedProd = normalizeProduct(raw.product || raw.Product || {});

  return {
    id,
    ID: id,
    user_id: userId,
    UserID: userId,
    product_id: productId,
    ProductID: productId,
    product: normalizedProd,
    Product: normalizedProd,
    created_at: raw.created_at || raw.CreatedAt,
  };
}

export const favoritesApi = {
  /**
   * List all favorites for the authenticated user (zero IDOR parameter leakage).
   */
  async list(): Promise<FavoriteItem[]> {
    const res = await apiClient.get("/api/v1/favorites");
    const items = Array.isArray(res.data.data) ? res.data.data : res.data;
    return (items || []).map(normalizeFavorite);
  },

  /**
   * Add a product to favorites.
   */
  async add(productId: number): Promise<FavoriteItem> {
    const res = await apiClient.post("/api/v1/favorites", {
      product_id: productId,
    });
    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeFavorite(data);
  },

  /**
   * Remove a product from favorites by product ID.
   */
  async remove(productId: number): Promise<void> {
    await apiClient.delete(`/api/v1/favorites/${productId}`);
  },

  /**
   * Check if a product is in the user's favorites.
   */
  async check(productId: number): Promise<boolean> {
    try {
      const res = await apiClient.get(`/api/v1/favorites/${productId}/check`);
      const payload = res.data?.data !== undefined ? res.data.data : res.data;
      return Boolean(payload?.is_favorite);
    } catch {
      return false;
    }
  },
};
