"use server";

import axios from "axios";
import { cookies } from "next/headers";
import getToken from '@/features/auth/api/getToken';

const BASE_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

/**
 * Fetches the current authenticated user's ID and profile data
 * using the V1 /api/v1/auth/me endpoint.
 */
const GetIdUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await axios.get(`${BASE_API_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: `jwt=${token}`,
      Authorization: `Bearer ${token}`,
    },
  });

  // V1 envelope: { success: true, data: { ... } }
  const data = res.data?.data || res.data;
  return data;
};

export default GetIdUser;
