import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isOpen: boolean;
}

const CART_STORAGE_KEY = "dashstack_cart";

function recalculateTotals(items: CartItem[]): { totalQuantity: number; totalPrice: number } {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    totalQuantity,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
}

function persistCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore write errors (e.g. private mode, quota exceeded)
    }
  }
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  isOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        id: number;
        title: string;
        price: number;
        image?: string;
        stock?: number;
        quantity?: number;
      }>
    ) => {
      const { id, title, price, image = "", stock = 999, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.id === id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        existing.quantity = stock > 0 ? Math.min(newQty, stock) : newQty;
        existing.stock = stock;
        existing.price = price;
        existing.title = title;
        if (image) existing.image = image;
      } else {
        const initialQty = stock > 0 ? Math.min(quantity, stock) : quantity;
        state.items.push({
          id,
          title,
          price,
          image,
          quantity: Math.max(1, initialQty),
          stock,
        });
      }

      const totals = recalculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      persistCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = recalculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      persistCart(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) {
          item.quantity = item.stock > 0 ? Math.min(quantity, item.stock) : quantity;
        }
      }
      const totals = recalculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      persistCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      persistCart([]);
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const totals = recalculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
