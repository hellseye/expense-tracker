"use client";

import { DashboardView } from "@/features/dashboard/dashboard-view";
import { useModal } from "@/components/shared/modal-context";

export default function DashboardPage() {
  const { openQuickAdd, openEditExpense } = useModal();
  return (
    <DashboardView
      onOpenQuickAdd={openQuickAdd}
      onEditExpense={openEditExpense}
    />
  );
}
