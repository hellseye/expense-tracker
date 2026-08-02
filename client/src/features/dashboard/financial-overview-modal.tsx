"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AnalyticsSummary, Expense } from "@/types";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Zap,
  Copy,
  Download,
  Check,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { getCategoryIcon } from "@/utils/category-icon";

interface FinancialOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics?: AnalyticsSummary;
  expenses?: Expense[];
}

export function FinancialOverviewModal({
  isOpen,
  onClose,
  analytics,
  expenses = [],
}: FinancialOverviewModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  // Derived financial metrics
  const totalSpent = analytics?.totalExpenses || 0;
  const income = analytics?.totalIncome || 0;
  const balance = analytics?.remainingBalance || Math.max(0, income - totalSpent);
  const todaySpend = analytics?.todaySpending || 0;
  const avgDaily = analytics?.averageDailySpending || 0;

  // Savings rate calculation
  const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
  const budgetScore = analytics?.budgetHealthScore || Math.min(100, Math.max(20, 100 - Math.round((totalSpent / (income || 1)) * 60)));

  // Top category
  const topCategory = analytics?.topCategories?.[0] || analytics?.categoryBreakdown?.[0];

  // Highest expense item
  const highestExpense = analytics?.highestExpense || expenses.reduce((max, exp) => (exp.amount > (max?.amount || 0) ? exp : max), null as Expense | null);

  // Currency symbol helper
  const currencySymbol = "₹";

  const handleCopyReport = () => {
    const textReport = `===========================================
📊 LEDGER EXECUTIVE FINANCIAL OVERVIEW
Generated on: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
===========================================

💡 FINANCIAL HEALTH SCORE: ${budgetScore}/100
-------------------------------------------
• Total Monthly Income:  ${currencySymbol}${income.toLocaleString("en-IN")}
• Total Monthly Expenses: ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Net Remaining Balance: ${currencySymbol}${balance.toLocaleString("en-IN")}
• Savings Rate: ${savingsRate}%

🔥 SPENDING METRICS
-------------------------------------------
• Today's Expenditure:  ${currencySymbol}${todaySpend.toLocaleString("en-IN")}
• Average Daily Spend:  ${currencySymbol}${avgDaily.toLocaleString("en-IN")}
• Highest Single Item:  ${highestExpense ? `${highestExpense.title} (${currencySymbol}${highestExpense.amount.toLocaleString("en-IN")})` : "N/A"}
• Top Category:         ${topCategory ? `${topCategory.name} (${currencySymbol}${topCategory.amount.toLocaleString("en-IN")})` : "N/A"}

🎯 AI RECOMMENDATIONS
-------------------------------------------
1. ${savingsRate >= 20 ? "Great job! Your savings rate is healthy above 20%." : "Consider reducing non-essential spending to improve savings."}
2. ${topCategory ? `Keep an eye on ${topCategory.name}, which represents your largest expense category.` : "Log more expenses to unlock category-specific savings."}
3. Maintain daily spending below ${currencySymbol}${Math.round((income * 0.7) / 30).toLocaleString("en-IN")} to stay within budget.

===========================================`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    toast({
      type: "success",
      title: "Report copied to clipboard",
      description: "Financial overview summary copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const textReport = `===========================================
📊 LEDGER EXECUTIVE FINANCIAL OVERVIEW
Generated on: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
===========================================

💡 FINANCIAL HEALTH SCORE: ${budgetScore}/100
-------------------------------------------
• Total Monthly Income:  ${currencySymbol}${income.toLocaleString("en-IN")}
• Total Monthly Expenses: ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Net Remaining Balance: ${currencySymbol}${balance.toLocaleString("en-IN")}
• Savings Rate: ${savingsRate}%

🔥 SPENDING METRICS
-------------------------------------------
• Today's Expenditure:  ${currencySymbol}${todaySpend.toLocaleString("en-IN")}
• Average Daily Spend:  ${currencySymbol}${avgDaily.toLocaleString("en-IN")}
• Highest Single Item:  ${highestExpense ? `${highestExpense.title} (${currencySymbol}${highestExpense.amount.toLocaleString("en-IN")})` : "N/A"}
• Top Category:         ${topCategory ? `${topCategory.name} (${currencySymbol}${topCategory.amount.toLocaleString("en-IN")})` : "N/A"}

===========================================`;

    const blob = new Blob([textReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-financial-overview-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: "success",
      title: "Report downloaded",
      description: "Saved overview report to your downloads folder.",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Executive Financial Overview"
      description="Real-time AI analysis of your cashflow, spending breakdown, and financial health score."
    >
      <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Health Rating Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/20 via-surface-200 to-surface-200 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-primary">Financial Intelligence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Audit
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Health Rating: <span className="text-primary">{budgetScore}/100</span>
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-zinc-400">Savings Capacity</span>
            <p className="text-base font-extrabold text-emerald-400">
              {savingsRate > 0 ? `+${savingsRate}% Income Saved` : "0% Saved"}
            </p>
          </div>
        </div>

        {/* Core Financial Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Monthly Income</span>
            </span>
            <p className="text-base font-extrabold text-zinc-100">
              {currencySymbol}{income.toLocaleString("en-IN")}
            </p>
          </Card>

          <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-rose-400" />
              <span>Total Spent</span>
            </span>
            <p className="text-base font-extrabold text-rose-300">
              {currencySymbol}{totalSpent.toLocaleString("en-IN")}
            </p>
          </Card>

          <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-primary" />
              <span>Net Cashflow</span>
            </span>
            <p className="text-base font-extrabold text-primary">
              {currencySymbol}{balance.toLocaleString("en-IN")}
            </p>
          </Card>
        </div>

        {/* Spending Insights & Category Distribution */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-primary" />
            <span>Category Spending Breakdown</span>
          </h4>

          <Card className="p-5 bg-surface-200/40 border-white/5 space-y-3">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              analytics.categoryBreakdown.slice(0, 4).map((cat) => {
                const CatIcon = getCategoryIcon(cat.name);
                return (
                  <div key={cat.id || cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-zinc-200">
                        <CatIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">{cat.percentage}%</span>
                        <span className="text-zinc-100 font-mono">{currencySymbol}{cat.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-surface-300 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400">No category spending recorded yet.</p>
            )}
          </Card>
        </div>

        {/* Key Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Highest Single Expense */}
          <Card className="p-4 bg-surface-200/40 border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-400" />
                <span>Largest Single Purchase</span>
              </span>
            </div>
            {highestExpense ? (
              <div>
                <p className="text-sm font-bold text-zinc-100 truncate">{highestExpense.title}</p>
                <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {currencySymbol}{highestExpense.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No transactions recorded</p>
            )}
          </Card>

          {/* Daily Burn Rate */}
          <Card className="p-4 bg-surface-200/40 border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-cyan-400" />
                <span>Average Daily Velocity</span>
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-100">
                {currencySymbol}{avgDaily.toLocaleString("en-IN")} <span className="text-xs text-zinc-400 font-normal">/ day</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Today's spend: <span className="text-zinc-200 font-bold">{currencySymbol}{todaySpend.toLocaleString("en-IN")}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Actionable Recommendations */}
        <Card className="p-4 bg-primary/10 border border-primary/20 space-y-2">
          <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            <span>AI Actionable Recommendations</span>
          </h5>
          <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              {savingsRate >= 20
                ? "Your current savings rate is excellent! Consider transferring surplus to long-term investments."
                : "Your savings margin is below 20%. Reducing discretionary category expenses could save extra funds each month."}
            </li>
            {topCategory && (
              <li>
                <span className="font-semibold text-zinc-100">{topCategory.name}</span> accounts for your largest expense volume. Setting a strict budget limit will optimize cashflow.
              </li>
            )}
          </ul>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyReport}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Report"}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadReport}>
              <Download className="h-3.5 w-3.5" />
              <span>Download Text</span>
            </Button>
          </div>

          <Button onClick={onClose}>
            <span>Done</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
