import { apiClient } from '@/lib/api/client';
import { Product, UpdateProdut } from "@/models/modles";

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category_id?: number;
  is_active?: boolean;
  all?: boolean;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;
  const id = raw.id ?? raw.ID ?? 0;
  return {
    ...raw,
    id,
    ID: id,
    images: Array.isArray(raw.images)
      ? raw.images
      : typeof raw.images === "string"
      ? [raw.images]
      : [],
    colors: Array.isArray(raw.colors) ? raw.colors : [],
    price:
      typeof raw.price === "number"
        ? raw.price
        : parseFloat(raw.price || "0") || 0,
    rating:
      typeof raw.rating === "number"
        ? raw.rating
        : parseFloat(raw.rating || "0") || 0,
    stock:
      typeof raw.stock === "number"
        ? raw.stock
        : parseInt(raw.stock || "0", 10) || 0,
    is_active: raw.is_active ?? true,
  };
}

export const productsApi = {
  async list(params?: ProductsQueryParams): Promise<PaginatedProductsResponse> {
    const res = await apiClient.get("/api/v1/products", { params });
    const payload = res.data;
    const items = payload.data || [];
    const meta = payload.meta || {
      total: items.length,
      page: params?.page || 1,
      last_page: 1,
    };

    return {
      data: items.map(normalizeProduct),
      meta,
    };
  },

  async listAll(): Promise<Product[]> {
    const res = await apiClient.get("/api/v1/products", {
      params: { all: true },
    });
    const items = Array.isArray(res.data.data) ? res.data.data : res.data;
    return (items || []).map(normalizeProduct);
  },

  async getById(id: number | string): Promise<Product> {
    const res = await apiClient.get(`/api/v1/products/${id}`);
    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeProduct(data);
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await apiClient.get(`/api/v1/products/slug/${encodeURIComponent(slug)}`);
    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeProduct(data);
  },

  async getByIdOrSlug(identifier: string | number): Promise<Product> {
    try {
      return await this.getById(identifier);
    } catch {
      return await this.getBySlug(String(identifier));
    }
  },

  async create(payload: Partial<Product>): Promise<Product> {
    const res = await apiClient.post("/api/v1/products", payload);
    return normalizeProduct(res.data.data !== undefined ? res.data.data : res.data);
  },

  async update(
    id: number | string,
    payload: Partial<Product> | UpdateProdut,
  ): Promise<Product> {
    const res = await apiClient.put(`/api/v1/products/${id}`, payload);
    return normalizeProduct(res.data.data !== undefined ? res.data.data : res.data);
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/api/v1/products/${id}`);
  },
};
