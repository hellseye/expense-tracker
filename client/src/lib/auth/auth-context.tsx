"use client";

import * as React from "react";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerUser: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore user session on initial load
  React.useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/v1/auth/session");
        const json = await res.json();
        const userData = json.user || json.data?.user;
        if (userData) {
          setUser(userData);
          if (json.accessToken) {
            localStorage.setItem("auth_token", json.accessToken);
          }
        } else {
          setUser(null);
          localStorage.removeItem("auth_token");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = React.useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      const userData = json.user || json.data?.user;
      if (!res.ok || !userData) {
        throw new Error(json.message || "Invalid credentials");
      }
      if (json.accessToken) {
        localStorage.setItem("auth_token", json.accessToken);
      }
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", { 
        method: "GET",
        redirect: "manual"
      });
      
      if (res.status === 400) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Google OAuth is not configured. Please check your client/.env file.");
      }
      
      window.location.href = "/api/auth/google";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = React.useCallback(async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, currency: "INR" }),
      });
      const json = await res.json();
      const userData = json.user || json.data?.user;
      if (!res.ok || !userData) {
        throw new Error(json.message || "Registration failed");
      }
      if (json.accessToken) {
        localStorage.setItem("auth_token", json.accessToken);
      }
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        loginWithGoogle,
        registerUser,
        logout,
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
