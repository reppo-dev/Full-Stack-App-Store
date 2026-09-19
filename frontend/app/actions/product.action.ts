import { Product, UpdateProdut } from "@/models/modles";
import { productsApi } from "@/lib/api/products";

export async function getPermitionProducts(page: number) {
  try {
    const res = await productsApi.list({ page, limit: 15 });
    return {
      product: {
        data: res.data,
        meta: res.meta,
      },
      success: true,
    };
  } catch {
    return { success: false, message: "we can't get your product in server" };
  }
}

export async function getProducts() {
  try {
    const products = await productsApi.listAll();
    return {
      product: products,
      success: true,
    };
  } catch {
    return { success: false, message: "we can't get your product in server" };
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
    const created = await productsApi.create(payload);
    return {
      success: true,
      data: created,
    };
  } catch {
    return {
      success: false,
      message: "failed to create product!",
    };
  }
}

export async function updateProduct(id: number, payload: UpdateProdut) {
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
    const updated = await productsApi.update(id, payload);
    return {
      success: true,
      data: updated,
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
    const product = await productsApi.getById(id);
    return {
      data: product,
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
    await productsApi.delete(id);
    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      message: "can't get details product",
    };
  }
}
