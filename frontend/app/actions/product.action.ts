import { Product } from "@/models/modles";
import axios from "axios";

export async function getPermitionProducts(page: number) {
  try {
    const result = await axios.get(
      `http://localhost:8000/api/products?page=${page}`,
    );

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

export async function createProduct(payload: Product) {
  try {
    if (
      !payload.images ||
      !payload.title ||
      !payload.description ||
      !payload.price
    ) {
      return {
        success: false,
        message: "required",
      };
    }
    const result = await axios.post(
      `http://localhost:8000/api/products`,
      payload,
    );

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      message: "failed to create product!",
    };
  }
}

export async function updateProduct(id: number, payload: Product) {
  try {
    if (
      !payload.images ||
      !payload.title ||
      !payload.description ||
      !payload.price
    ) {
      return {
        success: false,
        message: "required",
      };
    }
    const result = await axios.post(
      `http://localhost:8000/api/products/${id}`,
      payload,
    );

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      message: "failed to create product!",
    };
  }
}

export async function getDetailsProduct(id: number) {
  try {
    const result = await axios.get(`http://localhost:8000/api/products/${id}`);

    return {
      data: result.data,
      success: true,
    };
  } catch {
    return {
      success: false,
      message: "can't get details product",
    };
  }
}

export async function deleteProduct(id: number) {
  try {
    const result = await axios.delete(
      `http://localhost:8000/api/products/${id}`,
    );

    return {
      date: result.data,
      success: true,
    };
  } catch {
    return {
      success: false,
      message: "can't get details product",
    };
  }
}
