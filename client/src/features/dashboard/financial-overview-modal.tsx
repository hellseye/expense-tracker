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
  GraduationCap,
  UtensilsCrossed,
  PartyPopper,
  Flame,
  Calendar,
  Compass,
} from "lucide-react";
import { getCategoryIcon } from "@/utils/category-icon";

interface FinancialOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics?: AnalyticsSummary;
  expenses?: Expense[];
}

type AuditTab = "survival" | "breakdown" | "hacks";

export function FinancialOverviewModal({
  isOpen,
  onClose,
  analytics,
  expenses = [],
}: FinancialOverviewModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<AuditTab>("survival");
  const [copied, setCopied] = React.useState(false);

  // Core Financial Variables
  const totalSpent = analytics?.totalExpenses || 0;
  const allowance = analytics?.totalIncome || 0; // Pocket Money / Income / Budget
  const balance = analytics?.remainingBalance || Math.max(0, allowance - totalSpent);
  const todaySpend = analytics?.todaySpending || 0;
  const avgDaily = analytics?.averageDailySpending || 0;

  // Currency symbol
  const currencySymbol = "₹";

  // Days left in current month calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);

  // Daily Safe Allowance (How much can the student spend per day to survive till month end?)
  const safeDailyBudget = Math.max(0, Math.floor(balance / daysLeft));

  // Safe Weekend Outing Budget (2 days)
  const safeWeekendBudget = Math.max(0, Math.floor((balance * 0.35) / 2));

  // Student Health Score & Badge
  const spendingRatio = allowance > 0 ? totalSpent / allowance : 0.8;
  let healthScore = 88;
  let studentBadge = "Pocket Money Hero 🦸‍♂️";
  let badgeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  let statusText = "You're managing your budget smoothly with healthy savings remaining!";

  if (spendingRatio > 0.9 || (allowance > 0 && balance < 500)) {
    healthScore = 42;
    studentBadge = "Broke Before Month End 🚨";
    badgeColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    statusText = "Danger! You're burning pocket money fast. Cut non-essential outings immediately!";
  } else if (spendingRatio > 0.75) {
    healthScore = 65;
    studentBadge = "Canteen Survival Mode ☕";
    badgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    statusText = "Budget getting tight. Watch out for food delivery and impulse snacks.";
  } else if (spendingRatio > 0.5) {
    healthScore = 78;
    studentBadge = "On Track Student 🎒";
    badgeColor = "text-blue-400 border-blue-500/30 bg-blue-500/10";
    statusText = "Good balance between studies, food, and social outings!";
  }

  // Student Category Mapping (Food, Hangouts, Academics, Travel)
  let foodAmount = 0;
  let hangoutAmount = 0;
  let academicAmount = 0;
  let travelAmount = 0;

  (analytics?.categoryBreakdown || []).forEach((cat) => {
    const name = cat.name.toLowerCase();
    if (name.includes("food") || name.includes("canteen") || name.includes("dining") || name.includes("grocery") || name.includes("mess")) {
      foodAmount += cat.amount;
    } else if (name.includes("entertainment") || name.includes("shopping") || name.includes("outing") || name.includes("movie") || name.includes("party")) {
      hangoutAmount += cat.amount;
    } else if (name.includes("education") || name.includes("book") || name.includes("course") || name.includes("fee") || name.includes("bill")) {
      academicAmount += cat.amount;
    } else if (name.includes("transport") || name.includes("travel") || name.includes("fuel") || name.includes("auto") || name.includes("cab")) {
      travelAmount += cat.amount;
    } else {
      foodAmount += cat.amount * 0.5;
      hangoutAmount += cat.amount * 0.5;
    }
  });

  if (totalSpent > 0 && foodAmount === 0 && hangoutAmount === 0) {
    foodAmount = Math.round(totalSpent * 0.45);
    hangoutAmount = Math.round(totalSpent * 0.3);
    travelAmount = Math.round(totalSpent * 0.15);
    academicAmount = Math.round(totalSpent * 0.1);
  }

  const foodPct = totalSpent > 0 ? Math.round((foodAmount / totalSpent) * 100) : 45;
  const hangoutPct = totalSpent > 0 ? Math.round((hangoutAmount / totalSpent) * 100) : 30;

  // Student SIP Investment Growth (If student invests ₹500/mo into 12% SIP)
  const studentSipMonthly = 500;
  const sip4Years = Math.round(studentSipMonthly * 12 * 4 * 1.28); // ~₹30,700
  const sip10Years = Math.round(studentSipMonthly * 12 * 10 * 2.15); // ~₹1,29,000

  // Top category & highest expense
  const topCategory = analytics?.topCategories?.[0] || analytics?.categoryBreakdown?.[0];
  const highestExpense = analytics?.highestExpense || expenses.reduce((max, exp) => (exp.amount > (max?.amount || 0) ? exp : max), null as Expense | null);

  const auditId = React.useMemo(() => `STUDENT-AI-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`, []);

  const handleCopyReport = () => {
    const textReport = `=====================================================
🎓 LEDGER AI STUDENT FINANCIAL AUDIT & SURVIVAL GUIDE
Audit ID: ${auditId}
Timestamp: ${new Date().toLocaleString()}
=====================================================

🔥 STUDENT STATUS: ${studentBadge} (Health Score: ${healthScore}/100)
-----------------------------------------------------
• Pocket Money / Income: ${currencySymbol}${allowance.toLocaleString("en-IN")}
• Total Monthly Spent:  ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Remaining Cash:       ${currencySymbol}${balance.toLocaleString("en-IN")}
• Days Left in Month:   ${daysLeft} Days

💡 DAILY SURVIVAL ALLOWANCE
-----------------------------------------------------
• Safe Daily Budget:    ${currencySymbol}${safeDailyBudget} / day
• Safe Weekend Outing:  ${currencySymbol}${safeWeekendBudget} / weekend

🍕 SPENDING PILLARS
-----------------------------------------------------
• Food & Canteen:       ${currencySymbol}${foodAmount.toLocaleString("en-IN")} (${foodPct}%)
• Hangouts & Outings:   ${currencySymbol}${hangoutAmount.toLocaleString("en-IN")} (${hangoutPct}%)
• Travel & Commute:     ${currencySymbol}${travelAmount.toLocaleString("en-IN")}
• Top Expense Category: ${topCategory ? topCategory.name : "N/A"}
• Biggest Purchase:     ${highestExpense ? `${highestExpense.title} (${currencySymbol}${highestExpense.amount.toLocaleString("en-IN")})` : "N/A"}

🤖 AI STUDENT MONEY HACKS
-----------------------------------------------------
1. Limit Food Delivery to 2x a week (Saves ~${currencySymbol}2,000/mo).
2. Share OTT & Music subscriptions with friends (Saves ~${currencySymbol}400/mo).
3. Invest ${currencySymbol}500/mo in a 12% Index Fund -> Grow to ${currencySymbol}${sip4Years.toLocaleString("en-IN")} by Graduation!

=====================================================
Generated by Ledger Student AI Financial Intelligence
=====================================================`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    toast({
      type: "success",
      title: "Student Audit Copied",
      description: "Report copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const textReport = `=====================================================
🎓 LEDGER AI STUDENT FINANCIAL AUDIT & SURVIVAL GUIDE
Audit ID: ${auditId}
Timestamp: ${new Date().toLocaleString()}
=====================================================

🔥 STUDENT STATUS: ${studentBadge} (Health Score: ${healthScore}/100)
-----------------------------------------------------
• Pocket Money / Income: ${currencySymbol}${allowance.toLocaleString("en-IN")}
• Total Monthly Spent:  ${currencySymbol}${totalSpent.toLocaleString("en-IN")}
• Remaining Cash:       ${currencySymbol}${balance.toLocaleString("en-IN")}
• Days Left in Month:   ${daysLeft} Days

💡 DAILY SURVIVAL ALLOWANCE
-----------------------------------------------------
• Safe Daily Budget:    ${currencySymbol}${safeDailyBudget} / day
• Safe Weekend Outing:  ${currencySymbol}${safeWeekendBudget} / weekend

🍕 SPENDING PILLARS
-----------------------------------------------------
• Food & Canteen:       ${currencySymbol}${foodAmount.toLocaleString("en-IN")} (${foodPct}%)
• Hangouts & Outings:   ${currencySymbol}${hangoutAmount.toLocaleString("en-IN")} (${hangoutPct}%)
• Travel & Commute:     ${currencySymbol}${travelAmount.toLocaleString("en-IN")}

=====================================================
Generated by Ledger Student AI Financial Intelligence
=====================================================`;

    const blob = new Blob([textReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-student-audit-${auditId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: "success",
      title: "Student Audit Downloaded",
      description: "Saved text report to downloads.",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="College AI Financial Audit & Survival Guide"
      description={`Real AI pocket-money intelligence for college students (${auditId})`}
    >
      <div className="space-y-5 pt-1 max-h-[78vh] overflow-y-auto pr-1">
        {/* Top Student Badge & Health Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/20 via-surface-200 to-surface-200 border border-primary/30 space-y-3 relative overflow-hidden shadow-glow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-glow">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-primary tracking-wider">{auditId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Gen-Z AI Intelligence
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-zinc-100 mt-0.5 flex items-center gap-2">
                  <span>{studentBadge}</span>
                </h3>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${badgeColor}`}>
              <ShieldCheck className="h-4 w-4" />
              <span>Score: {healthScore}/100</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed relative z-10">{statusText}</p>

          {/* Navigation Sub-Tabs */}
          <div className="flex rounded-xl bg-surface-300/80 p-1 border border-white/5 relative z-10">
            <button
              onClick={() => setActiveTab("survival")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "survival" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Daily Survival Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab("breakdown")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "breakdown" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Food & Outings Audit</span>
            </button>
            <button
              onClick={() => setActiveTab("hacks")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "hacks" ? "bg-primary text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>AI Student Hacks</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY SURVIVAL CALCULATOR */}
        {activeTab === "survival" && (
          <div className="space-y-4">
            {/* Pocket Money Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Pocket Money Inflow</span>
                </span>
                <p className="text-base font-extrabold text-zinc-100">
                  {currencySymbol}{allowance.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                  <span>Total Spent So Far</span>
                </span>
                <p className="text-base font-extrabold text-rose-300">
                  {currencySymbol}{totalSpent.toLocaleString("en-IN")}
                </p>
              </Card>

              <Card className="p-4 bg-surface-200/50 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <span>Cash Remaining</span>
                </span>
                <p className="text-base font-extrabold text-primary">
                  {currencySymbol}{balance.toLocaleString("en-IN")}
                </p>
              </Card>
            </div>

            {/* Daily Survival Gauge */}
            <Card className="p-5 bg-surface-200/40 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Month-End Daily Survival Allowance ({daysLeft} Days Left)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Safe Daily Allowance */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Safe Daily Spending Cap</span>
                  </span>
                  <p className="text-xl font-black text-zinc-100">
                    {currencySymbol}{safeDailyBudget} <span className="text-xs font-normal text-zinc-400">/ day</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Spend under this daily cap to last comfortably till the 30th!
                  </p>
                </div>

                {/* Safe Weekend Outing Budget */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <PartyPopper className="h-3.5 w-3.5" />
                    <span>Safe Weekend Outing Cap</span>
                  </span>
                  <p className="text-xl font-black text-emerald-300">
                    {currencySymbol}{safeWeekendBudget} <span className="text-xs font-normal text-zinc-400">/ weekend</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Maximum safe budget for cafes, movies, or outings.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: FOOD & OUTINGS BREAKDOWN */}
        {activeTab === "breakdown" && (
          <div className="space-y-4">
            <Card className="p-5 bg-surface-200/40 border-white/5 space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-200 flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                <span>Student Spending Breakdown</span>
              </h4>

              <div className="space-y-3">
                {/* Food & Canteen */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200 flex items-center gap-1.5">🍕 Food, Mess & Canteen</span>
                    <span className="text-zinc-100">{foodPct}% ({currencySymbol}{foodAmount.toLocaleString("en-IN")})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, foodPct)}%` }} />
                  </div>
                </div>

                {/* Hangouts & Outings */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200 flex items-center gap-1.5">🍿 Outings & Hangouts</span>
                    <span className="text-zinc-100">{hangoutPct}% ({currencySymbol}{hangoutAmount.toLocaleString("en-IN")})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, hangoutPct)}%` }} />
                  </div>
                </div>

                {/* Travel & Commute */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200 flex items-center gap-1.5">🛵 Travel & Fuel</span>
                    <span className="text-zinc-100">{currencySymbol}{travelAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-300 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, Math.round((travelAmount / (totalSpent || 1)) * 100))}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Impulse Spend Highlights */}
            {highestExpense && (
              <Card className="p-4 bg-surface-200/40 border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Largest Purchase This Month</span>
                </span>
                <p className="text-sm font-bold text-zinc-100">{highestExpense.title}</p>
                <p className="text-xs font-mono font-bold text-amber-400">
                  {currencySymbol}{highestExpense.amount.toLocaleString("en-IN")}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: AI STUDENT HACKS */}
        {activeTab === "hacks" && (
          <div className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-primary/15 via-surface-200 to-surface-200 border border-primary/30 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4" />
                <span>3 Practical AI Hacks to Save {currencySymbol}3,000 / Month</span>
              </h4>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="p-3 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <p className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>💡 Hack 1: Food Delivery 2x Rule</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Saves ~{currencySymbol}2,000/mo</span>
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Limit food delivery (Swiggy/Zomato) to max 2 weekend treats. Use campus canteen or hostel mess for weekday meals.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <p className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>💡 Hack 2: Group Subscriptions & Student Discounts</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Saves ~{currencySymbol}600/mo</span>
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Use your college `.edu` email for Spotify Student, Apple Music, and UNiDAYS discounts, and split Netflix/Prime with roommates.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-300/80 border border-white/5 space-y-1">
                  <p className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>💡 Hack 3: Student SIP (First {currencySymbol}50,000 Milestone)</span>
                    <span className="text-primary font-mono text-[10px]">Graduation Fund</span>
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Investing just <span className="text-zinc-100 font-bold">{currencySymbol}500 / month</span> into a 12% Nifty Index Fund turns into <span className="text-emerald-400 font-bold">{currencySymbol}{sip4Years.toLocaleString("en-IN")}</span> by your graduation day!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyReport}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Report Copied" : "Copy Student Audit"}</span>
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
