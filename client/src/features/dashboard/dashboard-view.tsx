"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { StatCards } from "./stat-cards";
import { SpendingChart } from "./spending-chart";
import { RecentTransactions } from "./recent-transactions";
import { FinancialOverviewModal } from "./financial-overview-modal";
import { Button } from "@/components/ui/button";
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
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = React.useState(false);

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

  // Generate / Refresh Overview Handler
  const handleGenerateOverview = () => {
    setIsGenerating(true);
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    setTimeout(() => {
      setIsGenerating(false);
      setIsOverviewModalOpen(true);
      toast({
        type: "success",
        title: "Financial Overview Generated",
        description: "AI audit complete. Executive financial insights ready.",
      });
    }, 500);
  };

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
      {/* Top Banner / Financial Overview Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-100 to-surface-100 shadow-card">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Financial Overview</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track your balance, monthly income, and daily expenses in real time.
          </p>
        </div>

        <Button onClick={handleGenerateOverview} isLoading={isGenerating} className="shadow-glow">
          <Sparkles className="h-4 w-4 text-purple-200" />
          <span>Generate Financial Overview</span>
        </Button>
      </div>

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

      {/* Financial Overview Executive Report Modal */}
      <FinancialOverviewModal
        isOpen={isOverviewModalOpen}
        onClose={() => setIsOverviewModalOpen(false)}
        analytics={analytics}
        expenses={recentExpenses}
      />
    </div>
  );
}
