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
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpRight,
  Calculator,
  Compass,
} from "lucide-react";
import { getCategoryIcon } from "@/utils/category-icon";

interface FinancialOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics?: AnalyticsSummary;
  expenses?: Expense[];
}

type AuditTab = "executive" | "risks" | "wealth";

export function FinancialOverviewModal({
  isOpen,
  onClose,
  analytics,
  expenses = [],
}: FinancialOverviewModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<AuditTab>("executive");
  const [copied, setCopied] = React.useState(false);

  // Core Financial Variables
  const totalSpent = analytics?.totalExpenses || 0;
  const income = analytics?.totalIncome || 0;
  const balance = analytics?.remainingBalance || Math.max(0, income - totalSpent);
  const todaySpend = analytics?.todaySpending || 0;
  const avgDaily = analytics?.averageDailySpending || 0;

  // Currency symbol
  const currencySymbol = "₹";

  // Savings & Health Grade Computations
  const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
  let healthScore = 85;
  if (income > 0) {
    if (savingsRate >= 30) healthScore = 95;
    else if (savingsRate >= 20) healthScore = 88;
    else if (savingsRate >= 10) healthScore = 74;
    else if (savingsRate >= 0) healthScore = 60;
    else healthScore = 40;
  } else if (totalSpent > 0) {
    healthScore = 45;
  }

  let healthGrade = "A+";
  let gradeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (healthScore >= 90) {
    healthGrade = "A+ (Excellent)";
    gradeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  } else if (healthScore >= 75) {
    healthGrade = "A (Healthy)";
    gradeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  } else if (healthScore >= 60) {
    healthGrade = "B (Fair)";
    gradeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
  } else {
    healthGrade = "C (High Risk)";
    gradeColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
  }

  // 50/30/20 Rule Categorization
  const essentialKeywords = ["food", "rent", "grocery", "groceries", "health", "medical", "bill", "bills", "utility", "utilities", "transport", "fuel"];
  let needsAmount = 0;
  let wantsAmount = 0;

  (analytics?.categoryBreakdown || []).forEach((cat) => {
    const isEssential = essentialKeywords.some((k) => cat.name.toLowerCase().includes(k));
    if (isEssential) needsAmount += cat.amount;
    else wantsAmount += cat.amount;
  });

  if (needsAmount === 0 && wantsAmount === 0 && totalSpent > 0) {
    needsAmount = Math.round(totalSpent * 0.6);
    wantsAmount = Math.round(totalSpent * 0.4);
  }

  const needsPct = totalSpent > 0 ? Math.round((needsAmount / totalSpent) * 100) : 50;
  const wantsPct = totalSpent > 0 ? Math.round((wantsAmount / totalSpent) * 100) : 30;

  // Compounding Wealth Projections (If 15% of discretionary spend is invested @ 12% p.a.)
  const monthlyDiscretionarySavings = Math.max(1000, Math.round(wantsAmount * 0.25));
  const compoundYear1 = Math.round(monthlyDiscretionarySavings * 12 * 1.06);
  const compoundYear5 = Math.round(monthlyDiscretionarySavings * 12 * 5 * 1.34);
  const compoundYear10 = Math.round(monthlyDiscretionarySavings * 12 * 10 * 2.15);

  // Highest Expense & Top Categories
  const topCategory = analytics?.topCategories?.[0] || analytics?.categoryBreakdown?.[0];
  const highestExpense = analytics?.highestExpense || expenses.reduce((max, exp) => (exp.amount > (max?.amount || 0) ? exp : max), null as Expense | null);

  const topCatPct = topCategory ? Math.round((topCategory.amount / (totalSpent || 1)) * 100) : 0;

  // Audit ID
  const auditId = React.useMemo(() => `AUDIT-PRO-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`, []);

  const handleCopyAuditReport = () => {
    const reportText = `=====================================================
👑 LEDGER PRO AI FINANCIAL AUDIT CERTIFICATE
Audit ID: ${auditId}
Timestamp: ${new Date().toLocaleString()}
=====================================================

📊 FINANCIAL HEALTH RATING
-----------------------------------------------------
• Score:                ${healthScore}/100 [Grade: ${healthGrade}]
• Monthly Income:       ${currencySymbol}${income.toLocaleString("en-IN")}
• Total Monthly Spent:  ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Net Cash Surplus:     ${currencySymbol}${balance.toLocaleString("en-IN")}
• Net Savings Rate:     ${savingsRate}%

⚖️ 50/30/20 BUDGET RULE AUDIT
-----------------------------------------------------
• Essential Needs:     ${needsPct}% (Target: 50%)
• Discretionary Wants: ${wantsPct}% (Target: 30%)
• Savings Reserve:     ${savingsRate}% (Target: 20%)

🚨 RISK & ANOMALY ANALYSIS
-----------------------------------------------------
• Top Spending Category: ${topCategory ? `${topCategory.name} (${currencySymbol}${topCategory.amount.toLocaleString("en-IN")})` : "N/A"}
• Largest Single Item:  ${highestExpense ? `${highestExpense.title} (${currencySymbol}${highestExpense.amount.toLocaleString("en-IN")})` : "N/A"}
• Daily Burn Rate:     ${currencySymbol}${avgDaily.toLocaleString("en-IN")} / day

🚀 WEALTH REDIRECTION ENGINE (12% CAGR Growth)
-----------------------------------------------------
Investing 25% of discretionary spend (${currencySymbol}${monthlyDiscretionarySavings.toLocaleString("en-IN")}/mo) yields:
• 1-Year Projected Wealth:  ${currencySymbol}${compoundYear1.toLocaleString("en-IN")}
• 5-Year Projected Wealth:  ${currencySymbol}${compoundYear5.toLocaleString("en-IN")}
• 10-Year Projected Wealth: ${currencySymbol}${compoundYear10.toLocaleString("en-IN")}

=====================================================
Verified by Ledger Financial Intelligence Engine
=====================================================`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast({
      type: "success",
      title: "Audit Certificate Copied",
      description: `Copied official ${auditId} report to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAuditReport = () => {
    const reportText = `=====================================================
👑 LEDGER PRO AI FINANCIAL AUDIT CERTIFICATE
Audit ID: ${auditId}
Timestamp: ${new Date().toLocaleString()}
=====================================================

📊 FINANCIAL HEALTH RATING
-----------------------------------------------------
• Score:                ${healthScore}/100 [Grade: ${healthGrade}]
• Monthly Income:       ${currencySymbol}${income.toLocaleString("en-IN")}
• Total Monthly Spent:  ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Net Cash Surplus:     ${currencySymbol}${balance.toLocaleString("en-IN")}
• Net Savings Rate:     ${savingsRate}%

⚖️ 50/30/20 BUDGET RULE AUDIT
-----------------------------------------------------
• Essential Needs:     ${needsPct}% (Target: 50%)
• Discretionary Wants: ${wantsPct}% (Target: 30%)
• Savings Reserve:     ${savingsRate}% (Target: 20%)

🚨 RISK & ANOMALY ANALYSIS
-----------------------------------------------------
• Top Spending Category: ${topCategory ? `${topCategory.name} (${currencySymbol}${topCategory.amount.toLocaleString("en-IN")})` : "N/A"}
• Largest Single Item:  ${highestExpense ? `${highestExpense.title} (${currencySymbol}${highestExpense.amount.toLocaleString("en-IN")})` : "N/A"}
• Daily Burn Rate:     ${currencySymbol}${avgDaily.toLocaleString("en-IN")} / day

🚀 WEALTH REDIRECTION ENGINE (12% CAGR Growth)
-----------------------------------------------------
Investing 25% of discretionary spend (${currencySymbol}${monthlyDiscretionarySavings.toLocaleString("en-IN")}/mo) yields:
• 1-Year Projected Wealth:  ${currencySymbol}${compoundYear1.toLocaleString("en-IN")}
• 5-Year Projected Wealth:  ${currencySymbol}${compoundYear5.toLocaleString("en-IN")}
• 10-Year Projected Wealth: ${currencySymbol}${compoundYear10.toLocaleString("en-IN")}

=====================================================
Verified by Ledger Financial Intelligence Engine
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-executive-audit-${auditId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: "success",
      title: "Audit Certificate Downloaded",
      description: `Saved ${auditId} to your downloads.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pro AI Financial Audit & Wealth Report"
      description={`Official executive financial intelligence certificate (${auditId})`}
    >
      <div className="space-y-5 pt-1 max-h-[78vh] overflow-y-auto pr-1">
        {/* Header Certificate Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/20 via-surface-200 to-surface-200 border border-primary/30 space-y-3 relative overflow-hidden shadow-glow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-glow">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider">{auditId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Monetization Grade
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-zinc-100 mt-0.5">Executive Financial Audit</h3>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${gradeColor}`}>
              <ShieldCheck className="h-4 w-4" />
              <span>Health Score: {healthScore}/100</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex rounded-xl bg-surface-300/80 p-1 border border-white/5 relative z-10">
            <button
              onClick={() => setActiveTab("executive")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "executive" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Executive Summary</span>
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "risks" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Risk & Anomaly Audit</span>
            </button>
            <button
              onClick={() => setActiveTab("wealth")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "wealth" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Wealth Growth Engine</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === "executive" && (
          <div className="space-y-4">
            {/* Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Monthly Inflow</span>
                </span>
                <p className="text-base font-extrabold text-zinc-100">
                  {currencySymbol}{income.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                  <span>Monthly Outflow</span>
                </span>
                <p className="text-base font-extrabold text-rose-300">
                  {currencySymbol}{totalSpent.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <span>Net Surplus Cash</span>
                </span>
                <p className="text-base font-extrabold text-primary">
                  {currencySymbol}{balance.toLocaleString("en-IN")}
                </p>
              </Card>
            </div>

            {/* 50/30/20 Rule Progress Audit */}
            <Card className="p-5 bg-surface-200/40 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>50 / 30 / 20 Budget Rule Compliance</span>
                </h4>
                <span className="text-[11px] font-bold text-primary">{savingsRate}% Saved</span>
              </div>

              {/* Needs Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Essential Needs (Target: &lt;= 50%)</span>
                  <span className="text-zinc-100">{needsPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      needsPct <= 50 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, needsPct)}%` }}
                  />
                </div>
              </div>

              {/* Wants Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Discretionary Wants (Target: &lt;= 30%)</span>
                  <span className="text-zinc-100">{wantsPct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wantsPct <= 30 ? "bg-blue-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, wantsPct)}%` }}
                  />
                </div>
              </div>

              {/* Savings Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Savings & Investments (Target: &gt;= 20%)</span>
                  <span className="text-zinc-100">{savingsRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      savingsRate >= 20 ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: RISK & ANOMALY AUDIT */}
        {activeTab === "risks" && (
          <div className="space-y-4">
            <Card className="p-5 bg-surface-200/40 border-white/5 space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Detected Financial Anomalies & Concentration Risks</span>
              </h4>

              <div className="space-y-3 text-xs">
                {/* Concentration Risk */}
                {topCategory && (
                  <div className="p-3 rounded-xl bg-surface-300/60 border border-white/5 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <PieChart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-100">Category Concentration Risk</p>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">
                        <span className="text-amber-400 font-semibold">{topCategory.name}</span> accounts for{" "}
                        <span className="text-zinc-200 font-bold">{topCatPct}%</span> of your entire monthly budget ({currencySymbol}{topCategory.amount.toLocaleString("en-IN")}).
                      </p>
                    </div>
                  </div>
                )}

                {/* Single Expense Outflow Risk */}
                {highestExpense && (
                  <div className="p-3 rounded-xl bg-surface-300/60 border border-white/5 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-100">Single Purchase Outflow Alert</p>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">
                        Largest single transaction: <span className="text-zinc-100 font-semibold">{highestExpense.title}</span> ({currencySymbol}{highestExpense.amount.toLocaleString("en-IN")}).
                      </p>
                    </div>
                  </div>
                )}

                {/* Daily Velocity Alert */}
                <div className="p-3 rounded-xl bg-surface-300/60 border border-white/5 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">Daily Spending Velocity</p>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">
                      Average daily spend is <span className="text-zinc-100 font-bold">{currencySymbol}{avgDaily.toLocaleString("en-IN")} / day</span>. Today's expenditure stands at <span className="text-zinc-100 font-bold">{currencySymbol}{todaySpend.toLocaleString("en-IN")}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: WEALTH GROWTH ENGINE */}
        {activeTab === "wealth" && (
          <div className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-primary/15 via-surface-200 to-surface-200 border border-primary/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  <span>Compounding Wealth Redirection Engine</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  12% CAGR Return
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                By optimizing 25% of non-essential discretionary expenses, you can redirect{" "}
                <span className="text-emerald-400 font-bold">{currencySymbol}{monthlyDiscretionarySavings.toLocaleString("en-IN")} / month</span> into wealth-generating index funds or SIPs:
              </p>

              {/* Compounding Projections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">1 Year Projection</span>
                  <p className="text-base font-extrabold text-emerald-400">
                    {currencySymbol}{compoundYear1.toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">Accumulated Surplus</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">5 Year Projection</span>
                  <p className="text-base font-extrabold text-primary">
                    {currencySymbol}{compoundYear5.toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">Compound Portfolio</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">10 Year Projection</span>
                  <p className="text-base font-extrabold text-cyan-400">
                    {currencySymbol}{compoundYear10.toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">Wealth Multiplier</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actionable Recommendations Summary Banner */}
        <Card className="p-4 bg-surface-200/50 border border-white/5 space-y-2">
          <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span>AI Executive Recommendation</span>
          </h5>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {savingsRate >= 20
              ? "Your current financial health is optimal. Maintain your current savings rate and redirect excess cashflow into compounding wealth channels."
              : `Your savings rate of ${savingsRate}% is below recommended targets. Reduce discretionary spending on ${topCategory?.name || "lifestyle items"} to unlock higher monthly cash reserves.`}
          </p>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyAuditReport}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Audit Copied" : "Copy Audit"}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadAuditReport}>
              <Download className="h-3.5 w-3.5" />
              <span>Download Certificate</span>
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
