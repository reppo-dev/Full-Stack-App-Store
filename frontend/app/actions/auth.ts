"use server";

import { UserLogin, UserRegister } from "@/models/modles";
import axios from "axios";
import { cookies } from "next/headers";

export async function registerAction(paylod: UserRegister) {
  try {
    if (
      !paylod.user_name ||
      !paylod.email ||
      !paylod.password ||
      !paylod.password_confirm
    ) {
      return {
        success: false,
        message:
          "Missing required fields: email, name,password,confirm password and password are mandatory.",
      };
    }
    const body: Record<string, unknown> = {
      name: paylod.user_name,
      email: paylod.email,
      password: paylod.password,
      password_confirm: paylod.password_confirm,
    };

    const response = await axios.post(
      `http://localhost:8000/api/register`,
      body,
    );

    const token = response.data.token;
    const cookieStore = await cookies();
    cookieStore.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return { success: true, message: "Register success." };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export const loginAction = async (payload: UserLogin) => {
  try {
    if (!payload.password || !payload.email) {
      return {
        success: false,
        message: "Missing required fields: email, and password are mandatory.",
      };
    }
    const body: Record<string, unknown> = {
      email: payload.email,
      password: payload.password,
    };

    const response = await axios.post(`http://localhost:8000/api/login`, body);

    const token = response.data.token;

    const cookieStore = await cookies();
    cookieStore.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return { success: true, message: "Login success." };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
};
