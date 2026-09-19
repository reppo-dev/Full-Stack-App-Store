import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import uiReducer from "./slices/uiSlice";
import cartReducer from "./slices/cartSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      cart: cartReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
