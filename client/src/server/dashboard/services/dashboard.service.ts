import { prisma } from "@/lib/db/prisma";

export class DashboardService {
  static async getSummary(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch total expenses, current month expenses, today's expenses, top categories, and recent transactions in parallel
    const [
      totalExpenseSum,
      currentMonthSum,
      todaySum,
      recentExpenses,
      categories,
    ] = await Promise.all([
      // Total Expenses all-time sum
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      // Current Month Expenses sum
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
      // Today's Expenses sum
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: today },
        },
        _sum: { amount: true },
      }),
      // Recent Transactions (Latest 5 items)
      prisma.expense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { expenseDate: "desc" },
        take: 5,
      }),
      // Group by Category to find Top Categories
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: { userId },
        _sum: { amount: true },
        orderBy: {
          _sum: { amount: "desc" },
        },
        take: 5,
      }),
    ]);

    // Resolve Category details for Top Categories list
    const topCategoriesList = await Promise.all(
      categories.map(async (group) => {
        const cat = await prisma.category.findUnique({
          where: { id: group.categoryId },
        });
        return {
          id: group.categoryId,
          name: cat?.name || "Other",
          color: cat?.color || "#8B5CF6",
          amount: Number(group._sum.amount || 0),
        };
      })
    );

    return {
      totalExpenses: Number(totalExpenseSum._sum.amount || 0),
      currentMonthSpending: Number(currentMonthSum._sum.amount || 0),
      todaysSpending: Number(todaySum._sum.amount || 0),
      recentTransactions: recentExpenses,
      topCategories: topCategoriesList,
    };
  }
}
