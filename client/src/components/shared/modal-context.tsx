"use client";

import * as React from "react";
import { Expense } from "@/types";

interface ModalContextType {
  isQuickAddOpen: boolean;
  expenseToEdit: Expense | null;
  openQuickAdd: () => void;
  openEditExpense: (expense: Expense) => void;
  closeQuickAdd: () => void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);

  const openQuickAdd = React.useCallback(() => {
    setExpenseToEdit(null);
    setIsQuickAddOpen(true);
  }, []);

  const openEditExpense = React.useCallback((expense: Expense) => {
    setExpenseToEdit(expense);
    setIsQuickAddOpen(true);
  }, []);

  const closeQuickAdd = React.useCallback(() => {
    setIsQuickAddOpen(false);
    setExpenseToEdit(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isQuickAddOpen,
        expenseToEdit,
        openQuickAdd,
        openEditExpense,
        closeQuickAdd,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
