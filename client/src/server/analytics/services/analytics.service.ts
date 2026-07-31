import { prisma } from "@/lib/db/prisma";

export class AnalyticsService {
  static async getSummary(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [expenses, categories] = await Promise.all([
      prisma.expense.findMany({
        where: { userId },
        orderBy: { expenseDate: "asc" },
      }),
      prisma.category.findMany({
        where: { userId },
      }),
    ]);

    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 1. Category Distribution
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.categoryId] = (catMap[e.categoryId] || 0) + Number(e.amount);
    });

    const categoryBreakdown = categories
      .map((c) => {
        const amount = catMap[c.id] || 0;
        return {
          id: c.id,
          name: c.name,
          color: c.color,
          amount,
          percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        };
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // 2. Monthly Expense Graph (Past 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = 0;
    }

    expenses.forEach((e) => {
      const d = new Date(e.expenseDate);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += Number(e.amount);
      }
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2)),
    }));

    // 3. Average daily spending over past 30 days
    const recentExpenses = expenses.filter((e) => new Date(e.expenseDate) >= thirtyDaysAgo);
    const recentSum = recentExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const averageDailySpending = Number((recentSum / 30).toFixed(2));

    // 4. Highest Spending Day
    const dayMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const dayKey = new Date(e.expenseDate).toISOString().split("T")[0];
      dayMap[dayKey] = (dayMap[dayKey] || 0) + Number(e.amount);
    });

    let highestDay = "N/A";
    let highestAmount = 0;

    Object.entries(dayMap).forEach(([day, amount]) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestDay = day;
      }
    });

    return {
      totalExpenses,
      categoryBreakdown,
      monthlyTrend,
      averageDailySpending,
      highestSpendingDay: {
        date: highestDay,
        amount: Number(highestAmount.toFixed(2)),
      },
    };
  }
}
