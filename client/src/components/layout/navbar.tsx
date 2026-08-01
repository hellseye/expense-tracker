"use client";

import * as React from "react";
import { Plus, Search, Menu } from "lucide-react";
import { getTimeGreeting } from "@/lib/utils";
import { Button } from "../ui/button";

import { useAuth } from "@/lib/auth/auth-context";

interface NavbarProps {
  onOpenQuickAdd: () => void;
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Navbar({ onOpenQuickAdd, onOpenSearch, onOpenMobileMenu }: NavbarProps) {
  const { user } = useAuth();
  const userName = user?.name || "Guest";
  const greeting = getTimeGreeting(userName);
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-background/60 px-6 backdrop-blur-xl">
      {/* Left: Mobile Trigger & Greeting */}
      <div className="flex items-center gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{greeting}</h1>
          <p className="text-xs text-zinc-400">{todayDate}</p>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-3">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-surface-200/60 px-3 py-1.5 text-xs text-zinc-400 hover:border-white/20 hover:text-zinc-200 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 rounded bg-surface-300 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/10">
              /
            </kbd>
          </button>
        )}

        <Button onClick={onOpenQuickAdd} size="sm" className="shadow-glow">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Expense</span>
          <kbd className="hidden md:inline-flex ml-1.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono text-white">
            ⌘N
          </kbd>
        </Button>
      </div>
    </header>
  );
}
