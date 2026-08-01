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
    const catCountMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.categoryId] = (catMap[e.categoryId] || 0) + Number(e.amount);
      catCountMap[e.categoryId] = (catCountMap[e.categoryId] || 0) + 1;
    });

    const categoryBreakdown = categories
      .map((c) => {
        const amount = catMap[c.id] || 0;
        return {
          id: c.id,
          name: c.name,
          color: c.color,
          amount,
          count: catCountMap[c.id] || 0,
          percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        };
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // 2. Payment Method Distribution Breakdown
    const pmMap: Record<string, number> = {};
    expenses.forEach((e) => {
      pmMap[e.paymentMethod] = (pmMap[e.paymentMethod] || 0) + Number(e.amount);
    });

    const paymentMethodBreakdown = Object.entries(pmMap).map(([method, amount]) => ({
      method,
      amount: Number(amount.toFixed(2)),
      percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // 3. Monthly Expense Graph (Past 6 Months)
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

    // 4. Month-Over-Month Comparison
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthExpenses = expenses
      .filter((e) => new Date(e.expenseDate) >= currentMonthStart)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const prevMonthExpenses = expenses
      .filter((e) => {
        const d = new Date(e.expenseDate);
        return d >= prevMonthStart && d <= prevMonthEnd;
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const monthChangePercentage =
      prevMonthExpenses > 0
        ? Number((((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100).toFixed(1))
        : 0;

    // 5. Average daily spending over past 30 days
    const recentExpenses = expenses.filter((e) => new Date(e.expenseDate) >= thirtyDaysAgo);
    const recentSum = recentExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const averageDailySpending = Number((recentSum / 30).toFixed(2));

    // 6. Highest Spending Day
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

    // 7. Highest Single Expense Transaction
    const highestExpenseRaw = expenses.reduce((max, e) => {
      return !max || Number(e.amount) > Number(max.amount) ? e : max;
    }, null as any);

    const highestExpense = highestExpenseRaw
      ? {
          id: highestExpenseRaw.id,
          title: highestExpenseRaw.title,
          amount: Number(highestExpenseRaw.amount),
          expenseDate: highestExpenseRaw.expenseDate.toISOString(),
          paymentMethod: highestExpenseRaw.paymentMethod,
          categoryId: highestExpenseRaw.categoryId,
          userId: highestExpenseRaw.userId,
          createdAt: highestExpenseRaw.createdAt.toISOString(),
          updatedAt: highestExpenseRaw.updatedAt.toISOString(),
        }
      : null;

    // 8. Top categories list mapping
    const topCategories = categoryBreakdown.slice(0, 3);

    // 9. Calculate totalIncome, remainingBalance, todaySpending, healthScore
    const totalIncome = 120000; // Baseline allocation
    const remainingBalance = Math.max(0, totalIncome - totalExpenses);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaySpending = expenses
      .filter((e) => new Date(e.expenseDate) >= startOfToday)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const budgetHealthScore = Math.max(
      10,
      Math.min(100, Math.round(100 - (currentMonthExpenses / totalIncome) * 100))
    );

    return {
      totalExpenses,
      totalIncome,
      remainingBalance,
      todaySpending,
      categoryBreakdown,
      paymentMethodBreakdown,
      monthlyTrend,
      averageDailySpending,
      highestExpense,
      topCategories,
      monthOverMonth: {
        currentMonth: currentMonthExpenses,
        previousMonth: prevMonthExpenses,
        changePercentage: monthChangePercentage,
      },
      budgetHealthScore,
      highestSpendingDay: {
        date: highestDay,
        amount: Number(highestAmount.toFixed(2)),
      },
    };
  }
}
