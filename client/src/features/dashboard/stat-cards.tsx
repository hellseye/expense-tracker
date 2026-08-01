"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsSummary } from "@/types";

interface StatCardsProps {
  analytics?: AnalyticsSummary;
  isLoading?: boolean;
}

export function StatCards({ analytics, isLoading }: StatCardsProps) {
  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Expenses",
      value: formatCurrency(analytics.totalExpenses),
      subtitle: "All-time recorded spending",
      icon: DollarSign,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      trend: "+4.2% vs last month",
      isPositive: false,
    },
    {
      title: "Today's Spending",
      value: formatCurrency(analytics.todaySpending),
      subtitle: "Transactions today",
      icon: Calendar,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      trend: "Daily summary",
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} hoverable className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-zinc-100 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs border-t border-white/5 pt-3">
              <span className="text-zinc-500">{card.subtitle}</span>
              <span className={`font-medium ${card.color}`}>{card.trend}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
