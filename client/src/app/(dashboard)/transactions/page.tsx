"use client";

import { TransactionsView } from "@/features/expenses/transactions-view";
import { useModal } from "@/components/shared/modal-context";

export default function TransactionsPage() {
  const { openQuickAdd, openEditExpense } = useModal();
  return (
    <TransactionsView
      onOpenQuickAdd={openQuickAdd}
      onEditExpense={openEditExpense}
    />
  );
}
