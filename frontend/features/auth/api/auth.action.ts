"use server";

import { UserLogin, UserRegister } from "@/models/modles";
import axios from "axios";
import { cookies } from "next/headers";
import getToken from '@/features/auth/api/getToken';

const BASE_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function registerAction(payload: UserRegister) {
  try {
    if (
      !payload.user_name ||
      !payload.email ||
      !payload.password ||
      !payload.password_confirm
    ) {
      return {
        success: false,
        message:
          "Missing required fields: email, username, password, and confirm password are mandatory.",
      };
    }

    const body: Record<string, unknown> = {
      user_name: payload.user_name,
      email: payload.email,
      password: payload.password,
      password_confirm: payload.password_confirm,
      first_name: payload.first_name || "",
      last_name: payload.last_name || "",
      image: payload.image || "",
      phone_number: payload.phone_number || "",
    };

    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/register`, body, {
      headers: { "Content-Type": "application/json" },
    });

    let token =
      response.data?.data?.token ||
      response.data?.token;

    if (!token) {
      const setCookie = response.headers["set-cookie"];
      if (setCookie && Array.isArray(setCookie)) {
        const jwtCookie = setCookie.find((c) => c.startsWith("jwt="));
        if (jwtCookie) {
          token = jwtCookie.split(";")[0].split("=")[1];
        }
      }
    }

    if (!token) {
      return { success: false, message: "No authentication token received from server." };
    }

    const cookieStore = await cookies();
    cookieStore.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true, message: "Registration successful." };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const msg =
        err.response.data?.error?.message ||
        err.response.data?.message ||
        "Registration failed.";
      return { success: false, message: msg };
    }
    return {
      success: false,
      message: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

export const loginAction = async (payload: UserLogin) => {
  try {
    if (!payload.password || !payload.email) {
      return {
        success: false,
        message: "Missing required fields: email and password are mandatory.",
      };
    }

    const body: Record<string, unknown> = {
      email: payload.email,
      password: payload.password,
    };

    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/login`, body, {
      headers: { "Content-Type": "application/json" },
    });

    let token =
      response.data?.data?.token ||
      response.data?.token;

    if (!token) {
      const setCookie = response.headers["set-cookie"];
      if (setCookie && Array.isArray(setCookie)) {
        const jwtCookie = setCookie.find((c) => c.startsWith("jwt="));
        if (jwtCookie) {
          token = jwtCookie.split(";")[0].split("=")[1];
        }
      }
    }

    if (!token) {
      return { success: false, message: "No authentication token received from server." };
    }

    const cookieStore = await cookies();
    cookieStore.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true, message: "Login successful." };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const msg =
        err.response.data?.error?.message ||
        err.response.data?.message ||
        "Invalid email or password.";
      return { success: false, message: msg };
    }
    return {
      success: false,
      message: "An unexpected error occurred during login. Please try again.",
    };
  }
};

export const getuserAction = async () => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
      };
    }

    const response = await axios.get(`${BASE_API_URL}/api/v1/auth/me`, {
      headers: {
        Cookie: `jwt=${token}`,
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data?.data || response.data;
    return {
      success: true,
      user: userData,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred retrieving user profile",
    };
  }
};
