"use server";

import { UpdateUser } from "@/models/modles";
import axios from "axios";
import getToken from "./getToken";

const BASE_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function allUser(page: number) {
  try {
    const token = await getToken();
    let response;
    try {
      response = await axios.get(
        `${BASE_API_URL}/api/v1/users/?page=${page}`,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      response = await axios.get(
        `${BASE_API_URL}/api/users?page=${page}`,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    const payload = response.data?.data || response.data;
    if (payload.data && payload.last_page !== undefined) {
      return {
        users: payload.data,
        last_page: payload.last_page,
      };
    }

    return {
      users: response.data.data,
      last_page: response.data.meta?.last_page || 1,
    };
  } catch {
    return {
      success: false,
      message: "cant get all user with page",
    };
  }
}

export async function allusers() {
  try {
    const token = await getToken();
    let response;
    try {
      response = await axios.get(`${BASE_API_URL}/api/v1/users/all`, {
        headers: {
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      response = await axios.get(`${BASE_API_URL}/api/user`, {
        headers: {
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
      });
    }

    const users = response.data?.data || response.data;
    return {
      success: true,
      users,
    };
  } catch {
    return {
      success: false,
      message: "failed to fetch all user",
    };
  }
}

export async function getuser(id: number) {
  try {
    const token = await getToken();
    let result;
    try {
      result = await axios.get(`${BASE_API_URL}/api/v1/users/${id}`, {
        headers: {
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      result = await axios.get(`${BASE_API_URL}/api/users/${id}`, {
        headers: {
          Cookie: `jwt=${token}`,
          Authorization: `Bearer ${token}`,
        },
      });
    }

    const user = result.data?.data || result.data;
    return {
      success: true,
      user,
    };
  } catch {
    return {
      success: false,
      message: "failed to get information user",
    };
  }
}

export async function updatingUser(id: number, payload: UpdateUser) {
  try {
    if (!payload.email || !payload.user_name || !payload.role_id) {
      return {
        success: false,
        message: "payload values are incomplete",
      };
    }

    const token = await getToken();
    let result;
    try {
      result = await axios.put(
        `${BASE_API_URL}/api/v1/users/${id}`,
        payload,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      result = await axios.put(
        `${BASE_API_URL}/api/users/${id}`,
        payload,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    const updated = result.data?.data || result.data;
    return {
      success: true,
      update: updated,
    };
  } catch {
    return {
      success: false,
      message: "failed to update user!",
    };
  }
}

export async function deleteUser(id: number) {
  try {
    const token = await getToken();
    let response;
    try {
      response = await axios.delete(
        `${BASE_API_URL}/api/v1/users/${id}`,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      response = await axios.delete(
        `${BASE_API_URL}/api/users/${id}`,
        {
          headers: {
            Cookie: `jwt=${token}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    return {
      success: true,
      deletedUser: response.data?.data || response.data,
    };
  } catch {
    return {
      success: false,
      message: "failed to delete user",
    };
  }
}
