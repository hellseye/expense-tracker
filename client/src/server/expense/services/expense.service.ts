import { ExpenseRepository } from "../repositories/expense.repository";
import { CreateExpenseInput, UpdateExpenseInput, QueryExpenseInput } from "@/validations/expense.validation";
import { prisma } from "@/lib/db/prisma";

export class ExpenseService {
  static async listExpenses(userId: string, filters: QueryExpenseInput) {
    const { items, total } = await ExpenseRepository.findMany(userId, filters);
    
    return {
      expenses: items,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit) || 1,
      },
    };
  }

  static async getExpenseDetails(id: string, userId: string) {
    const expense = await ExpenseRepository.findById(id, userId);
    if (!expense) {
      throw new Error("Expense transaction not found");
    }
    return expense;
  }

  static async createExpense(userId: string, input: CreateExpenseInput) {
    // Verify Category exists and belongs to the user
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw new Error("Invalid category selected");
    }

    return ExpenseRepository.create(userId, input);
  }

  static async updateExpense(id: string, userId: string, input: UpdateExpenseInput) {
    const existing = await ExpenseRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Expense transaction not found");
    }

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      });
      if (!category) {
        throw new Error("Invalid category selected");
      }
    }

    return ExpenseRepository.update(id, userId, input);
  }

  static async deleteExpense(id: string, userId: string) {
    const existing = await ExpenseRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Expense transaction not found");
    }

    return ExpenseRepository.delete(id, userId);
  }

  static async exportCSV(userId: string): Promise<string> {
    const { items: expenses } = await ExpenseRepository.findMany(userId, {
      page: 1,
      limit: 1000,
      sortBy: "expenseDate",
      sortOrder: "desc",
    });

    const headers = ["ID", "Title", "Amount", "Category", "Payment Method", "Date", "Notes"];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      Number(e.amount).toFixed(2),
      `"${(e.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.expenseDate.toISOString().split("T")[0],
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}
