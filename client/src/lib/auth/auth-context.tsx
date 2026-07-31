"use client";

import * as React from "react";
import { UserProfile } from "@/types";
import { appConfig } from "../config/app-config";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  // Connection slots for external auth integration
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setAuthToken: (token: string) => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_demo_mayank",
  name: "Mayank",
  email: "mayank@ledger.dev",
  currency: appConfig.defaultCurrency,
  theme: "dark",
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(DEFAULT_USER);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Check local storage for plugged-in external JWT auth token
    const storedToken = localStorage.getItem(appConfig.auth.tokenStorageKey);
    const storedUser = localStorage.getItem(appConfig.auth.userStorageKey);

    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(DEFAULT_USER);
      }
    }
  }, []);

  /**
   * PLUGGABLE BACKEND CONNECTION SLOT: Login Credentials
   * Hook your custom backend auth endpoint here (e.g. POST /api/v1/auth/login)
   */
  const login = React.useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (appConfig.backendMode === "REMOTE_HTTP") {
        const res = await fetch(`${appConfig.apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (json.token) {
          localStorage.setItem(appConfig.auth.tokenStorageKey, json.token);
          localStorage.setItem(appConfig.auth.userStorageKey, JSON.stringify(json.user));
          setToken(json.token);
          setUser(json.user);
          return;
        }
      }

      // Default demo session fallback
      const demoUser = { ...DEFAULT_USER, email };
      setUser(demoUser);
      localStorage.setItem(appConfig.auth.userStorageKey, JSON.stringify(demoUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * PLUGGABLE BACKEND CONNECTION SLOT: Google OAuth SSO
   * Hook your OAuth provider redirect here (e.g. Supabase, NextAuth, Better Auth)
   */
  const loginWithGoogle = React.useCallback(async () => {
    if (appConfig.backendMode === "REMOTE_HTTP") {
      window.location.href = `${appConfig.apiBaseUrl}/auth/google`;
      return;
    }
    setUser(DEFAULT_USER);
  }, []);

  /**
   * PLUGGABLE BACKEND CONNECTION SLOT: Logout & Revoke Session
   */
  const logout = React.useCallback(async () => {
    localStorage.removeItem(appConfig.auth.tokenStorageKey);
    localStorage.removeItem(appConfig.auth.userStorageKey);
    setToken(null);
    setUser(null);
  }, []);

  const setAuthToken = React.useCallback((newToken: string) => {
    localStorage.setItem(appConfig.auth.tokenStorageKey, newToken);
    setToken(newToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        token,
        login,
        loginWithGoogle,
        logout,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
