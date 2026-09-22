import { apiClient } from '@/lib/api/client';

export interface OrderItem {
  id: number;
  ID: number;
  order_id: number;
  product_id: number;
  product_title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  ID: number;
  user_id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  total: number;
  status: string;
  address: string;
  phone_number: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderItemInput {
  product_id: number;
  quantity: number;
}

export interface CreateOrderInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  address?: string;
  phone_number?: string;
  order_items: CreateOrderItemInput[];
  idempotency_key?: string;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export interface RawOrderItem {
  id?: number | string;
  ID?: number | string;
  order_id?: number | string;
  OrderID?: number | string;
  product_id?: number | string;
  ProductID?: number | string;
  product_title?: string;
  ProductTitle?: string;
  price?: number | string;
  quantity?: number | string;
  [key: string]: unknown;
}

export function normalizeOrderItem(raw: RawOrderItem | null | undefined): OrderItem {
  if (!raw) return raw as unknown as OrderItem;
  const id = Number(raw.id ?? raw.ID ?? 0);
  return {
    id,
    ID: id,
    order_id: Number(raw.order_id ?? raw.OrderID ?? 0),
    product_id: Number(raw.product_id ?? raw.ProductID ?? 0),
    product_title: raw.product_title ?? raw.ProductTitle ?? "",
    price:
      typeof raw.price === "number"
        ? raw.price
        : parseFloat(String(raw.price) || "0") || 0,
    quantity:
      typeof raw.quantity === "number"
        ? raw.quantity
        : parseInt(String(raw.quantity) || "0", 10) || 0,
  } as OrderItem;
}

export interface RawOrder {
  id?: number | string;
  ID?: number | string;
  user_id?: number | string;
  UserID?: number | string;
  first_name?: string;
  FirstName?: string;
  last_name?: string;
  LastName?: string;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  total?: number | string;
  status?: string;
  Status?: string;
  address?: string;
  Address?: string;
  phone_number?: string;
  PhoneNumber?: string;
  order_items?: RawOrderItem[];
  OrderItems?: RawOrderItem[];
  total_price?: number | string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
  [key: string]: unknown;
}

export function normalizeOrder(raw: RawOrder | null | undefined): Order {
  if (!raw) return raw as unknown as Order;
  const id = Number(raw.id ?? raw.ID ?? 0);
  const items = Array.isArray(raw.order_items)
    ? raw.order_items
    : Array.isArray(raw.OrderItems)
    ? raw.OrderItems
    : [];

  const firstName = raw.first_name || raw.FirstName || "";
  const lastName = raw.last_name || raw.LastName || "";
  const name =
    raw.name ||
    raw.Name ||
    `${firstName} ${lastName}`.trim() ||
    raw.email ||
    "Customer";

  const totalRaw = raw.total ?? raw.total_price ?? 0;

  return {
    id,
    ID: id,
    user_id: Number(raw.user_id ?? raw.UserID ?? 0),
    first_name: firstName,
    last_name: lastName,
    name,
    email: raw.email || raw.Email || "",
    total:
      typeof totalRaw === "number"
        ? totalRaw
        : parseFloat(String(totalRaw) || "0") || 0,
    status: raw.status || raw.Status || "pending",
    address: raw.address || raw.Address || "",
    phone_number: raw.phone_number || raw.PhoneNumber || "",
    order_items: items.map(normalizeOrderItem),
    created_at: raw.created_at || raw.CreatedAt || "",
    updated_at: raw.updated_at || raw.UpdatedAt || "",
  } as Order;
}

export const ordersApi = {
  /**
   * Fetch authenticated user's own orders.
   */
  async getMyOrders(params?: OrdersQueryParams): Promise<PaginatedOrdersResponse> {
    const res = await apiClient.get("/api/v1/orders/my", { params });
    const payload = res.data;
    const items = payload.data || [];
    const meta = payload.meta || {
      total: items.length,
      page: params?.page || 1,
      last_page: 1,
    };

    return {
      data: (items || []).map(normalizeOrder),
      meta,
    };
  },

  /**
   * Admin: List all orders with pagination.
   */
  async listAll(params?: OrdersQueryParams): Promise<PaginatedOrdersResponse> {
    const res = await apiClient.get("/api/v1/orders", { params });
    const payload = res.data;
    const items = payload.data || [];
    const meta = payload.meta || {
      total: items.length,
      page: params?.page || 1,
      last_page: 1,
    };

    return {
      data: (items || []).map(normalizeOrder),
      meta,
    };
  },

  /**
   * Fetch order details by ID.
   */
  async getById(id: number | string): Promise<Order> {
    const res = await apiClient.get(`/api/v1/orders/${id}`);
    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeOrder(data);
  },

  /**
   * Create a new order with atomic checkout and inventory verification.
   */
  async create(input: CreateOrderInput): Promise<Order> {
    const idempotencyKey =
      input.idempotency_key ||
      `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const res = await apiClient.post("/api/v1/orders", input, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });

    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeOrder(data);
  },

  /**
   * Admin: Update order status.
   */
  async updateStatus(id: number | string, status: string): Promise<Order> {
    const res = await apiClient.put(`/api/v1/orders/${id}/status`, { status });
    const data = res.data.data !== undefined ? res.data.data : res.data;
    return normalizeOrder(data);
  },

  /**
   * Export orders as a CSV download.
   */
  async exportCsv(): Promise<Blob> {
    const res = await apiClient.get("/api/v1/orders/export", {
      responseType: "blob",
    });
    return res.data;
  },

  /**
   * Fetch analytics chart data.
   */
  async getChart(): Promise<any[]> {
    const res = await apiClient.get("/api/v1/orders/chart");
    return res.data.data !== undefined ? res.data.data : res.data;
  },
};
