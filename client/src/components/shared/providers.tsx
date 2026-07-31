"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../ui/toast";
import { AuthProvider } from "@/lib/auth/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes stale time for personal tracking data
            refetchOnWindowFocus: false, // Prevent refetching simply on tab highlight change
            retry: (failureCount, error: any) => {
              // Do not retry query calls for authentication/authorization errors (401/403)
              const errorMessage = error?.message || "";
              if (
                errorMessage.includes("401") ||
                errorMessage.includes("403") ||
                errorMessage.includes("Unauthorized")
              ) {
                return false;
              }
              return failureCount < 2; // Limit standard network retries to 2 attempts max
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
