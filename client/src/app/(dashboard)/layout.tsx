"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { QuickAddModal } from "@/features/expenses/quick-add-modal";
import { ModalProvider, useModal } from "@/components/shared/modal-context";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { isQuickAddOpen, expenseToEdit, openQuickAdd, closeQuickAdd } = useModal();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Global Keyboard shortcut: ⌘N / Ctrl+N -> Quick Add Expense
  useKeyboardShortcut(
    { key: "n", metaKey: true },
    () => {
      openQuickAdd();
    },
    true
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm font-semibold">
        Verifying session details...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex h-screen w-full gap-3 p-3 bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Top Center Ambient Radial Accent Glow Gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] transition-all duration-500"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, var(--primary-glow, rgba(139,92,246,0.30)), transparent)",
        }}
      />

      {/* 80px Non-Expanding Dock Sidebar */}
      <Sidebar />

      {/* Main Content Card Container */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-surface-100/90 shadow-card transition-colors duration-300">
        <Navbar onOpenQuickAdd={openQuickAdd} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Global Quick Add / Edit Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ModalProvider>
  );
}
