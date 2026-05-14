import axios from "axios";

export async function getPermitionProducts() {
  try {
    const result = await axios.get(`http://localhost:8000/api/products`);

    return {
      product: result.data,
      success: true,
    };
  } catch {
    return { success: false, message: "we can`t get your product in server" };
  }
}

export async function getProducts() {
  try {
    const result = await axios.get(`http://localhost:8000/api/productss`);

    return {
      product: result.data,
      success: true,
    };
  } catch {
    return { success: false, message: "we can`t get your product in server" };
  }
}
