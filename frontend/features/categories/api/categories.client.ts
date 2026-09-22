import { apiClient } from '@/lib/api/client';
import { Category } from "@/models/modles";

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const res = await apiClient.get("/api/v1/categories");
    const items = res.data.data !== undefined ? res.data.data : res.data;
    return items || [];
  },

  async getTree(): Promise<Category[]> {
    const res = await apiClient.get("/api/v1/categories/tree");
    const items = res.data.data !== undefined ? res.data.data : res.data;
    return items || [];
  },

  async getById(id: number | string): Promise<Category> {
    const res = await apiClient.get(`/api/v1/categories/${id}`);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const res = await apiClient.get(`/api/v1/categories/slug/${encodeURIComponent(slug)}`);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async create(payload: Partial<Category>): Promise<Category> {
    const res = await apiClient.post("/api/v1/categories", payload);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async update(id: number | string, payload: Partial<Category>): Promise<Category> {
    const res = await apiClient.put(`/api/v1/categories/${id}`, payload);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },
};
