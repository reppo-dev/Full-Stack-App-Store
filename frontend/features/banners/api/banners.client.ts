import { apiClient } from '@/lib/api/client';
import { Banner } from "@/models/modles";

export interface CreateBannerPayload {
  title: string;
  subtitle: string;
  badge?: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  cta_link: string;
  type: string;
  position: number;
  is_active: boolean;
}

export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  badge?: string;
  image_url?: string;
  link_url?: string;
  cta_text?: string;
  cta_link?: string;
  type?: string;
  position?: number;
  is_active?: boolean;
}

export const bannersApi = {
  async listActive(type?: string): Promise<Banner[]> {
    const url = type ? `/api/v1/banners/active?type=${encodeURIComponent(type)}` : "/api/v1/banners/active";
    const res = await apiClient.get(url);
    const items = res.data.data !== undefined ? res.data.data : res.data;
    return items || [];
  },

  async listAllAdmin(): Promise<Banner[]> {
    const res = await apiClient.get("/api/v1/banners/admin");
    const items = res.data.data !== undefined ? res.data.data : res.data;
    return items || [];
  },

  async getById(id: number | string): Promise<Banner> {
    const res = await apiClient.get(`/api/v1/banners/${id}`);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async create(payload: CreateBannerPayload): Promise<Banner> {
    const res = await apiClient.post("/api/v1/banners/admin", payload);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async update(id: number | string, payload: UpdateBannerPayload): Promise<Banner> {
    const res = await apiClient.put(`/api/v1/banners/admin/${id}`, payload);
    return res.data.data !== undefined ? res.data.data : res.data;
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/api/v1/banners/admin/${id}`);
  },
};
