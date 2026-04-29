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

  const apiUrl = process.env.GOLANG_API_URL || "http://localhost:8000";

  try {
    const res = await axios.post(`${apiUrl}/api/login`, { email, password });

    const data = await res.data;

    console.log(data);

    const setCookie = res.headers["set-cookie"];
    let token: string | undefined;
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie)
        ? setCookie.join(";")
        : setCookie;
      const match = cookieStr.match(/jwt=([^;]+)/);
      token = match ? match[1] : undefined;
    }

    return { success: true, token };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      return { error: data.message || "Login failed" };
    }
    return { error: "Connection error" };
  }
}
