import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds data freshness
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Do not retry client errors (4xx)
          if (error && typeof error === "object" && "statusCode" in error) {
            const status = (error as { statusCode: number }).statusCode;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a singleton QueryClient in browser runtime, or a fresh QueryClient per SSR request.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
