"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Award, Calendar, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SpendingChart } from "@/features/dashboard/spending-chart";
import { ApiClient } from "@/lib/api/api-client";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsSummary, ApiResponse } from "@/types";

export function AnalyticsView() {
  const { data, isLoading } = useQuery<ApiResponse<AnalyticsSummary>>({
    queryKey: ["analytics"],
    queryFn: () => ApiClient.get<ApiResponse<AnalyticsSummary>>("/analytics"),
  });

  const summary = data?.data;

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-zinc-400">Deep-dive breakdown of your spending habits and statistics.</p>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverable className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Highest Expense</p>
            <h4 className="text-lg font-bold text-zinc-100 mt-0.5">
              {summary.highestExpense ? formatCurrency(summary.highestExpense.amount) : "₹0.00"}
            </h4>
            <p className="text-[11px] text-zinc-500 truncate max-w-[180px]">
              {summary.highestExpense ? summary.highestExpense.title : "No transactions"}
            </p>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Daily Average</p>
            <h4 className="text-lg font-bold text-zinc-100 mt-0.5">
              {formatCurrency(summary.averageDailySpending)}
            </h4>
            <p className="text-[11px] text-zinc-500">Based on 30-day projection</p>
          </div>
        </Card>

        <Card hoverable className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Top Category</p>
            <h4 className="text-lg font-bold text-zinc-100 mt-0.5">
              {summary.topCategories[0]?.name || "N/A"}
            </h4>
            <p className="text-[11px] text-zinc-500">
              {summary.topCategories[0] ? formatCurrency(summary.topCategories[0].amount) : "₹0.00"}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Category Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-zinc-100 tracking-tight">Category Distribution</h3>
            <p className="text-xs text-zinc-400">Percentage share of total expenses</p>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center">
            {summary.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-500">No category breakdown data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090b" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: "#121215",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem",
                      color: "#fff",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Badges Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/5">
            {summary.categoryBreakdown.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5 text-xs text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name} ({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Spending Trend Chart */}
        <SpendingChart data={summary.monthlyTrend} />
      </div>

      {/* Top Spending Categories Table List */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-zinc-100 tracking-tight mb-4">Top Spending Categories</h3>
        <div className="divide-y divide-white/5">
          {summary.categoryBreakdown.map((cat, idx) => (
            <div key={cat.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-zinc-500">#{idx + 1}</span>
                <Badge color={cat.color}>{cat.name}</Badge>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-zinc-400">{cat.count} expenses</span>
                <span className="text-zinc-100 font-bold text-sm">{formatCurrency(cat.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
