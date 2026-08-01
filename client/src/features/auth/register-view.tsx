"use client";

import * as React from "react";
import { Wallet, Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/auth-context";

export function RegisterView() {
  const { registerUser } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast({
        type: "error",
        title: "Registration error",
        description: "Please enter your name.",
      });
    }

    if (!email.trim()) {
      return toast({
        type: "error",
        title: "Registration error",
        description: "Please enter your email address.",
      });
    }

    if (password.length < 6) {
      return toast({
        type: "error",
        title: "Registration error",
        description: "Password must be at least 6 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return toast({
        type: "error",
        title: "Registration error",
        description: "Passwords do not match.",
      });
    }

    setIsLoading(true);

    try {
      await registerUser(name, email, password);
      toast({
        type: "success",
        title: "Account created",
        description: "Welcome to Ledger! Redirecting to dashboard...",
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        type: "error",
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent-purple shadow-glow mb-2">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-zinc-400">Get started with Ledger to track your personal finance easily.</p>
        </div>

        <Card className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
              <Input
                type="text"
                placeholder="e.g. Mayank Dev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              <span>Sign Up</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-white/5">
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
