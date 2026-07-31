/**
 * Ledger Production Application Configuration
 *
 * Plug-and-Play Backend Architecture:
 * - Set `BACKEND_MODE: "REMOTE_HTTP"` to route all operations to an external API server (Express, Nest, Go, etc.)
 * - Set `BACKEND_MODE: "LOCAL_PRISMA"` to run with Next.js Route Handlers + Prisma ORM + PostgreSQL
 */

export const appConfig = {
  appName: "Ledger",
  version: "1.0.0",

  // Connection mode: 'LOCAL_PRISMA' | 'REMOTE_HTTP'
  backendMode: (process.env.NEXT_PUBLIC_BACKEND_MODE as "LOCAL_PRISMA" | "REMOTE_HTTP") || "LOCAL_PRISMA",

  // Base API URL for remote backend server
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",

  // Default Regional Settings
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "INR",
  defaultLocale: "en-IN",

  // Auth Configuration
  auth: {
    tokenStorageKey: "ledger_auth_token",
    userStorageKey: "ledger_user_profile",
  },

  // Pagination Defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
