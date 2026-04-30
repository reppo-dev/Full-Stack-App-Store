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
    return { error: "Password and repeat are not the same" };
  }

  const apiUrl = "http://localhost:3000";

  const res = await axios.post(`${apiUrl}/api/register`, {
    user_name,
    email,
    password,
    password_confirm,
  });

  const data = await res.data;
  console.log("Login response:", data);

  return { success: true };
}
