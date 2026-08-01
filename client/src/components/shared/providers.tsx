"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ToastProvider } from "../ui/toast";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ApiClient } from "@/lib/api/api-client";
import { ApiResponse } from "@/types";

// Active Theme Watcher to apply OLED, Dark, Light themes and custom Accent colors dynamically
function ThemeWatcher() {
  const { data: profileRes } = useQuery<ApiResponse<any>>({
    queryKey: ["userProfile"],
    queryFn: () => ApiClient.get<ApiResponse<any>>("/user/profile").catch(() => ({ success: false })),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  React.useEffect(() => {
    const applyThemeSettings = () => {
      const root = window.document.documentElement;
      
      // 1. Apply Display Theme Mode classes
      const theme = profileRes?.data?.theme || localStorage.getItem("ledger_theme") || "dark";
      root.classList.remove("light", "dark", "oled");

      if (theme === "system") {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(isSystemDark ? "dark" : "light");
      } else {
        root.classList.add(theme);
      }

      // 2. Apply Custom Accent Color & Secondary Gradient overrides
      const savedAccent = localStorage.getItem("ledger_accent_color");
      const savedSecondary = localStorage.getItem("ledger_secondary_color");
      const savedIsGradient = localStorage.getItem("ledger_is_gradient");

      if (savedAccent) {
        root.style.setProperty("--primary", savedAccent);
        root.style.setProperty("--primary-hover", adjustColorBrightness(savedAccent, -15));
        root.style.setProperty("--primary-glow", `${savedAccent}40`);
      } else {
        root.style.removeProperty("--primary");
        root.style.removeProperty("--primary-hover");
        root.style.removeProperty("--primary-glow");
      }

      if (savedSecondary) {
        root.style.setProperty("--secondary", savedSecondary);
      } else {
        root.style.removeProperty("--secondary");
      }

      if (savedAccent && savedSecondary && savedIsGradient === "true") {
        root.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${savedAccent}, ${savedSecondary})`);
      } else if (savedAccent) {
        root.style.setProperty("--primary-gradient", savedAccent);
      }
    };

    applyThemeSettings();

    // Listen to local storage changes (for live settings updates)
    window.addEventListener("storage", applyThemeSettings);
    return () => window.removeEventListener("storage", applyThemeSettings);
  }, [profileRes]);

  return null;
}

// Utility to darken/lighten color code for active hover states
function adjustColorBrightness(hex: string, percent: number): string {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, "0");
  const gHex = Math.round(G).toString(16).padStart(2, "0");
  const bHex = Math.round(B).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes stale time
            refetchOnWindowFocus: false, // Prevent refetching simply on tab focus
            retry: (failureCount, error: any) => {
              const errorMessage = error?.message || "";
              if (
                errorMessage.includes("401") ||
                errorMessage.includes("403") ||
                errorMessage.includes("Unauthorized")
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeWatcher />
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
