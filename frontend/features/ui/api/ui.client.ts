import { apiClient } from "@/lib/api/client";

export interface Brand {
  id: number;
  name: string;
  category: string | null;
  href: string | null;
  is_active: boolean;
}

export interface Story {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  category: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  gradient_class: string | null;
  icon_name: string | null;
  featured_price: string | null;
  is_active: boolean;
}

export const uiApi = {
  getBrands: async (): Promise<{ success: boolean; data: Brand[] }> => {
    return apiClient.get("/ui/brands");
  },
  getStories: async (): Promise<{ success: boolean; data: Story[] }> => {
    return apiClient.get("/ui/stories");
  },
};
