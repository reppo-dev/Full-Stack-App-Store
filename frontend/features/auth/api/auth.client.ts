import { apiClient } from '@/lib/api/client';
import { UserLogin, UserRegister } from "@/models/modles";

export interface AuthSuccessResponse {
  token: string;
  user: {
    id: number;
    user_name: string;
    email: string;
    role?: string;
    role_id: number;
  };
}

export const authApi = {
  async register(payload: UserRegister) {
    const res = await apiClient.post("/api/v1/auth/register", payload);
    return res.data;
  },

  async login(payload: UserLogin) {
    const res = await apiClient.post("/api/v1/auth/login", payload);
    return res.data;
  },

  async logout() {
    const res = await apiClient.post("/api/v1/auth/logout");
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get("/api/v1/auth/me");
    return res.data;
  },

  async updatePassword(password: string, passwordConfirm: string) {
    const res = await apiClient.put("/api/v1/auth/password", {
      password,
      password_confirm: passwordConfirm,
    });
    return res.data;
  },
};
