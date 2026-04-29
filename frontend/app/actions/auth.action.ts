"use server";

import axios from "axios";

export type LoginActionResponse = {
  success?: boolean;
  token?: string;
  error?: string;
};

export async function loginAction(
  prevState: LoginActionResponse,
  formData: FormData,
): Promise<LoginActionResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Enter email and password" };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const res = await axios.post(
      `${apiUrl}/api/login`,
      { email, password },
      {
        withCredentials: true, // این خط حیاتی است
      },
    );

    const data = await res.data;
    console.log("Login response:", data);

    // برای کوکی‌های HttpOnly، نیازی به دسترسی مستقیم نیست
    // کوکی به طور خودکار توسط مرورگر مدیریت می‌شود

    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      return { error: data.message || "Login failed" };
    }
    return { error: "Connection error" };
  }
}
