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
        const res = await fetch("/api/auth/session");
        const json = await res.json();
        if (json.success && json.data?.user) {
          setUser(json.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = React.useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Invalid credentials");
      }
      setUser(json.data.user);
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, currency: "INR" }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Registration failed");
      }
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
