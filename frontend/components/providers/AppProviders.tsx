"use client";

import React, { useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { getQueryClient } from "@/lib/query/client";
import { makeStore, AppStore } from "@/lib/redux/store";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Unified application state provider establishing the client boundary for
 * TanStack Query (server state) and Redux Toolkit (client UI state).
 */
export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = getQueryClient();
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
