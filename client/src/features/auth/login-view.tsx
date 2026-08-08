"use client";

import * as React from "react";
import { Wallet, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/auth-context";

export function LoginView() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        type: "success",
        title: "Welcome back to Ledger",
        description: "Authenticated successfully.",
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        type: "error",
        title: "Authentication failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        type: "info",
        title: "Google OAuth",
        description: "Redirecting to Google login provider...",
      });
    } catch (error: any) {
      toast({
        type: "error",
        title: "OAuth failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow mb-2">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ledger</h1>
          <p className="text-xs text-zinc-400">Minimal personal expense tracker for laptop, mobile & tablet.</p>
        </div>

        <Card className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              <span>Sign In with Email</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-surface-100 px-3 text-[11px] font-semibold text-zinc-500 uppercase">
              Or Continue With
            </span>
          </div>

          <div className="space-y-2.5">
            <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
              <Chrome className="h-4 w-4 text-zinc-300" />
              <span>Google SSO</span>
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-white/5">
            <p className="text-xs text-zinc-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold transition-all">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
