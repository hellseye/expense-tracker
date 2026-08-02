"use client";

import * as React from "react";
import { Wallet, Mail, Lock, User, ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/auth-context";
import { isLegitEmail, evaluatePasswordStrength, registerSchema } from "@/validations/auth.validation";

export function RegisterView() {
  const { registerUser } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const emailCheck = React.useMemo(() => isLegitEmail(email), [email]);
  const pwdCheck = React.useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast({
        type: "error",
        title: "Registration error",
        description: "Please enter your full name.",
      });
    }

    if (!emailCheck.isValid) {
      return toast({
        type: "error",
        title: "Invalid Email Address",
        description: emailCheck.reason || "Please enter a valid email address.",
      });
    }

    if (pwdCheck.score < 3) {
      return toast({
        type: "error",
        title: "Weak Password",
        description: "Please fulfill the password strength criteria (at least 8 chars, uppercase, number, and special symbol).",
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-400">Email Address</label>
                {email && (
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${emailCheck.isValid ? "text-emerald-400" : "text-accent-rose"}`}>
                    {emailCheck.isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>{emailCheck.isValid ? "Valid Email" : emailCheck.reason}</span>
                  </span>
                )}
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-400">Password</label>
                {password && (
                  <span className="text-[11px] font-bold" style={{ color: pwdCheck.color }}>
                    Strength: {pwdCheck.label}
                  </span>
                )}
              </div>
              <Input
                type="password"
                placeholder="Min. 8 characters with A-Z, 0-9 & symbols"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
              />

              {/* Password Strength Progress Gauge */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1.5 h-1.5 w-full bg-surface-300 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-300 rounded-full" style={{ width: "25%", backgroundColor: pwdCheck.score >= 1 ? pwdCheck.color : "transparent" }} />
                    <div className="h-full transition-all duration-300 rounded-full" style={{ width: "25%", backgroundColor: pwdCheck.score >= 2 ? pwdCheck.color : "transparent" }} />
                    <div className="h-full transition-all duration-300 rounded-full" style={{ width: "25%", backgroundColor: pwdCheck.score >= 3 ? pwdCheck.color : "transparent" }} />
                    <div className="h-full transition-all duration-300 rounded-full" style={{ width: "25%", backgroundColor: pwdCheck.score >= 4 ? pwdCheck.color : "transparent" }} />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-medium pt-1">
                    <span className={pwdCheck.checks.length ? "text-emerald-400" : "text-zinc-500"}>
                      {pwdCheck.checks.length ? "✓" : "○"} 8+ Characters
                    </span>
                    <span className={pwdCheck.checks.hasUpper ? "text-emerald-400" : "text-zinc-500"}>
                      {pwdCheck.checks.hasUpper ? "✓" : "○"} 1 Uppercase (A-Z)
                    </span>
                    <span className={pwdCheck.checks.hasNumber ? "text-emerald-400" : "text-zinc-500"}>
                      {pwdCheck.checks.hasNumber ? "✓" : "○"} 1 Number (0-9)
                    </span>
                    <span className={pwdCheck.checks.hasSpecial ? "text-emerald-400" : "text-zinc-500"}>
                      {pwdCheck.checks.hasSpecial ? "✓" : "○"} 1 Symbol (!@#$)
                    </span>
                  </div>
                </div>
              )}
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
