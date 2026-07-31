"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Receipt, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/dropdown";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense } from "@/types";

interface RecentTransactionsProps {
  expenses?: Expense[];
  isLoading?: boolean;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export function RecentTransactions({
  expenses = [],
  isLoading,
  onEditExpense,
  onDeleteExpense,
}: RecentTransactionsProps) {
  if (isLoading) {
    return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  }

  const recentList = expenses.slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-100 tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-zinc-400">Latest expense activity</p>
        </div>

        <Link
          href="/transactions"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
          <Receipt className="h-8 w-8 mb-2 opacity-40 text-primary" />
          <p className="text-sm font-medium">No recent transactions</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {recentList.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-3.5 group hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10"
                  style={{
                    backgroundColor: `${expense.category?.color || "#8B5CF6"}18`,
                    borderColor: `${expense.category?.color || "#8B5CF6"}30`,
                  }}
                >
                  <Receipt
                    className="h-4 w-4"
                    style={{ color: expense.category?.color || "#8B5CF6" }}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-primary transition-colors">
                    {expense.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color={expense.category?.color}>{expense.category?.name}</Badge>
                    <span className="text-[11px] text-zinc-400">{formatDate(expense.expenseDate)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-100">
                  -{formatCurrency(expense.amount)}
                </span>

                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  items={[
                    { label: "Edit", value: "edit", icon: <Edit2 className="h-3.5 w-3.5" /> },
                    { label: "Delete", value: "delete", icon: <Trash2 className="h-3.5 w-3.5" />, danger: true },
                  ]}
                  onSelect={(val) => {
                    if (val === "edit") onEditExpense(expense);
                    if (val === "delete") onDeleteExpense(expense.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
