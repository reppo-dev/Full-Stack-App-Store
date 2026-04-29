"use server";

import axios from "axios";

export type RegisterActionResponse = {
  success?: boolean;
  token?: string;
  error?: string;
};

export async function registerAction(
  prevState: RegisterActionResponse,
  formData: FormData,
): Promise<RegisterActionResponse> {
  const user_name = formData.get("user_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirm = formData.get("password_confirm") as string;

  if (password !== password_confirm) {
    return { error: "رمز عبور و تکرار آن یکسان نیستند" };
  }

  const apiUrl = process.env.GOLANG_API_URL || "http://localhost:8000";

  const res = await axios.post(`${apiUrl}/api/register`, {
    user_name,
    email,
    password,
    password_confirm,
  });

  const data = await res.data;

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
}
