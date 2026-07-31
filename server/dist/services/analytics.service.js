"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const expense_service_1 = require("./expense.service");
const category_service_1 = require("./category.service");
class AnalyticsService {
    static async getSummary(userId = "demo_user") {
        const { data: expenses } = await expense_service_1.ExpenseService.getExpenses({ limit: 1000 }, userId);
        const categories = await category_service_1.CategoryService.getCategories(userId);
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        // Total Expenses
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        // Default Monthly Income for dashboard comparison (₹150,000 baseline)
        const totalIncome = 150000.0;
        const remainingBalance = Math.max(0, totalIncome - totalExpenses);
        // Today's spending
        const todaySpending = expenses
            .filter((e) => e.date.startsWith(todayStr))
            .reduce((acc, curr) => acc + curr.amount, 0);
        // Category Breakdown
        const catMap = {};
        expenses.forEach((e) => {
            if (!catMap[e.categoryId]) {
                catMap[e.categoryId] = { amount: 0, count: 0 };
            }
            catMap[e.categoryId].amount += e.amount;
            catMap[e.categoryId].count += 1;
        });
        const categoryBreakdown = categories
            .map((c) => {
            const stats = catMap[c.id] || { amount: 0, count: 0 };
            return {
                id: c.id,
                name: c.name,
                color: c.color,
                amount: stats.amount,
                count: stats.count,
                percentage: totalExpenses > 0 ? Number(((stats.amount / totalExpenses) * 100).toFixed(1)) : 0,
            };
        })
            .filter((c) => c.amount > 0)
            .sort((a, b) => b.amount - a.amount);
        // Monthly Trend (Last 6 Months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap = {};
        // Initialize past 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyMap[key] = 0;
        }
        expenses.forEach((e) => {
            const d = new Date(e.date);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (monthlyMap[key] !== undefined) {
                monthlyMap[key] += e.amount;
            }
        });
        const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({
            month,
            amount: Number(amount.toFixed(2)),
        }));
        // Top Categories
        const topCategories = categoryBreakdown.slice(0, 4).map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            amount: c.amount,
        }));
        // Highest Expense
        const sortedByAmount = [...expenses].sort((a, b) => b.amount - a.amount);
        const highestExpense = sortedByAmount.length > 0 ? sortedByAmount[0] : null;
        // Average daily spending (over 30 days)
        const averageDailySpending = Number((totalExpenses / 30).toFixed(2));
        return {
            totalExpenses,
            totalIncome,
            remainingBalance,
            todaySpending,
            categoryBreakdown,
            monthlyTrend,
            topCategories,
            highestExpense,
            averageDailySpending,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
