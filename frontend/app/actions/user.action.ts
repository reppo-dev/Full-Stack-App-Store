"use server";
import axios from "axios";

export async function allUser(page: number) {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/users?page=${page}`,
    );

    return {
      users: response.data.data,
      last_page: response.data.meta.last_page,
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
    const response = await axios.get(`http://localhost:8000/api/user`);

    return {
      success: true,
      users: response.data.data,
    };
  } catch {
    return {
      success: false,
      message: "failed to fetch all user",
    };
  }
}
