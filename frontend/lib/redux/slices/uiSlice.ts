import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  activeModal: string | null;
  modalPayload: Record<string, unknown> | null;
  theme: "light" | "dark" | "system";
}

const initialState: UIState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },
  activeModal: null,
  modalPayload: null,
  theme: "system",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<{ modalId: string; payload?: Record<string, unknown> }>
    ) => {
      state.activeModal = action.payload.modalId;
      state.modalPayload = action.payload.payload || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalPayload = null;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
