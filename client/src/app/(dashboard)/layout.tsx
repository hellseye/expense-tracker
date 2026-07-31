"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { QuickAddModal } from "@/features/expenses/quick-add-modal";
import { ModalProvider, useModal } from "@/components/shared/modal-context";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isQuickAddOpen, expenseToEdit, openQuickAdd, closeQuickAdd } = useModal();

  // Global Keyboard shortcut: ⌘N / Ctrl+N -> Quick Add Expense
  useKeyboardShortcut(
    { key: "n", metaKey: true },
    () => {
      openQuickAdd();
    },
    true
  );

  return (
    <div className="relative flex h-screen w-full gap-3 p-3 bg-zinc-950 overflow-hidden">
      {/* Top Center #8B5CF6 Radial Ambient Purple Glow Gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.30),rgba(9,9,11,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/15 via-transparent to-zinc-950" />

      {/* 80px Non-Expanding Dock Sidebar */}
      <Sidebar />

      {/* Main Content Card Container (Pure Black, No Blur) */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-card">
        <Navbar onOpenQuickAdd={openQuickAdd} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
