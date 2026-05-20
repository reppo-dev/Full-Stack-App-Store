"use server";

import axios from "axios";
import getToken from "./getToken";

export async function orderUser() {
  try {
    const token = await getToken();
    const result = await axios.get("http://localhost:8000/getorderbyemail", {
      headers: {
        Cookie: `jwt=${token}`,
      },
    });

    return {
      data: result.data,
      success: true,
    };
  } catch {
    const message = "Failed to fetch orders";
    return { success: false, message };
  }
}
