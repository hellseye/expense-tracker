"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatCards } from "./stat-cards";
import { SpendingChart } from "./spending-chart";
import { RecentTransactions } from "./recent-transactions";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { AnalyticsSummary, Expense, ApiResponse } from "@/types";

interface DashboardViewProps {
  onOpenQuickAdd: () => void;
  onEditExpense: (expense: Expense) => void;
}

export function DashboardView({ onOpenQuickAdd, onEditExpense }: DashboardViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Analytics & Recent Expenses via ApiClient
  const { data: analyticsRes, isLoading: isAnalyticsLoading } = useQuery<ApiResponse<AnalyticsSummary>>({
    queryKey: ["analytics"],
    queryFn: () => ApiClient.get<ApiResponse<AnalyticsSummary>>("/analytics"),
  });

  const { data: expensesRes, isLoading: isExpensesLoading } = useQuery<ApiResponse<Expense[]>>({
    queryKey: ["expenses", 1, 5],
    queryFn: () => ApiClient.get<ApiResponse<Expense[]>>("/expenses", { limit: "5" }),
  });

  const analytics = analyticsRes?.data;
  const recentExpenses: Expense[] = expensesRes?.data || [];

  // Delete Mutation via ApiClient
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await ApiClient.delete<ApiResponse<null>>(`/expenses/${id}`);
      if (!res.success) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        type: "success",
        title: "Expense removed",
        description: "Transaction record deleted.",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <StatCards analytics={analytics} isLoading={isAnalyticsLoading} />

      {/* Charts & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={analytics?.monthlyTrend} isLoading={isAnalyticsLoading} />
        <RecentTransactions
          expenses={recentExpenses}
          isLoading={isExpensesLoading}
          onEditExpense={onEditExpense}
          onDeleteExpense={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
