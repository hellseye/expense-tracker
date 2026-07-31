import { prisma } from "../lib/db/prisma";
import { DEFAULT_EXPENSES, DEFAULT_CATEGORIES } from "../lib/store/demo-store";
import { CreateExpenseInput, UpdateExpenseInput } from "../validators/expense.validator";
import { Expense, ExpenseFilters } from "../types";

let inMemoryExpenses: Expense[] = [...DEFAULT_EXPENSES];

export class ExpenseService {
  static async getExpenses(filters: ExpenseFilters, userId = "demo_user") {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const where: any = { userId };

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { notes: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.categoryId && filters.categoryId !== "ALL") {
        where.categoryId = filters.categoryId;
      }

      if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
        where.paymentMethod = filters.paymentMethod;
      }

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = new Date(filters.startDate);
        if (filters.endDate) where.date.lte = new Date(filters.endDate);
      }

      const orderBy: any = {};
      const sortBy = filters.sortBy || "date";
      const sortOrder = filters.sortOrder || "desc";
      orderBy[sortBy] = sortOrder;

      const [dbExpenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: { category: true },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.expense.count({ where }),
      ]);

      if (dbExpenses.length > 0 || total > 0) {
        const formatted = dbExpenses.map((e) => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
          category: e.category
            ? {
                ...e.category,
                createdAt: e.category.createdAt.toISOString(),
                updatedAt: e.category.updatedAt.toISOString(),
              }
            : undefined,
        })) as Expense[];

        return {
          data: formatted,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      }
    } catch (error) {
      console.warn("Prisma unavailable, using in-memory expense store fallback.");
    }

    // In-memory filtering & sorting
    let filtered = [...inMemoryExpenses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    if (filters.categoryId && filters.categoryId !== "ALL") {
      filtered = filtered.filter((e) => e.categoryId === filters.categoryId);
    }

    if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
      filtered = filtered.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      filtered = filtered.filter((e) => new Date(e.date).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter((e) => new Date(e.date).getTime() <= end);
    }

    // Sort
    const sortBy = filters.sortBy || "date";
    const sortOrder = filters.sortOrder || "desc";

    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof Expense];
      let valB: any = b[sortBy as keyof Expense];

      if (sortBy === "date") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async createExpense(input: CreateExpenseInput, userId = "demo_user"): Promise<Expense> {
    const category = DEFAULT_CATEGORIES.find((c) => c.id === input.categoryId) || DEFAULT_CATEGORIES[0];

    try {
      const created = await prisma.expense.create({
        data: {
          title: input.title,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes,
          paymentMethod: input.paymentMethod,
          categoryId: input.categoryId,
          userId,
        },
        include: { category: true },
      });

      return {
        ...created,
        date: created.date.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        category: created.category
          ? {
              ...created.category,
              createdAt: created.category.createdAt.toISOString(),
              updatedAt: created.category.updatedAt.toISOString(),
            }
          : undefined,
      } as Expense;
    } catch (error) {
      const newExpense: Expense = {
        id: `exp_${Date.now()}`,
        title: input.title,
        amount: input.amount,
        date: new Date(input.date).toISOString(),
        notes: input.notes,
        paymentMethod: input.paymentMethod,
        categoryId: input.categoryId,
        category: category,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryExpenses.unshift(newExpense);
      return newExpense;
    }
  }

  static async updateExpense(id: string, input: UpdateExpenseInput, userId = "demo_user"): Promise<Expense> {
    try {
      const dataToUpdate: any = { ...input };
      if (input.date) dataToUpdate.date = new Date(input.date);

      const updated = await prisma.expense.update({
        where: { id, userId },
        data: dataToUpdate,
        include: { category: true },
      });

      return {
        ...updated,
        date: updated.date.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        category: updated.category
          ? {
              ...updated.category,
              createdAt: updated.category.createdAt.toISOString(),
              updatedAt: updated.category.updatedAt.toISOString(),
            }
          : undefined,
      } as Expense;
    } catch (error) {
      const index = inMemoryExpenses.findIndex((e) => e.id === id);
      if (index === -1) throw new Error("Expense not found");

      const category = input.categoryId
        ? DEFAULT_CATEGORIES.find((c) => c.id === input.categoryId) || inMemoryExpenses[index].category
        : inMemoryExpenses[index].category;

      inMemoryExpenses[index] = {
        ...inMemoryExpenses[index],
        ...input,
        date: input.date ? new Date(input.date).toISOString() : inMemoryExpenses[index].date,
        category,
        updatedAt: new Date().toISOString(),
      };

      return inMemoryExpenses[index];
    }
  }

  static async deleteExpense(id: string, userId = "demo_user"): Promise<boolean> {
    try {
      await prisma.expense.delete({
        where: { id, userId },
      });
      return true;
    } catch (error) {
      inMemoryExpenses = inMemoryExpenses.filter((e) => e.id !== id);
      return true;
    }
  }

  static async exportCSV(userId = "demo_user"): Promise<string> {
    const result = await this.getExpenses({ limit: 1000 }, userId);
    const expenses = result.data;

    const headers = ["ID", "Title", "Amount", "Category", "Payment Method", "Date", "Notes"];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      `"${(e.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.date.split("T")[0],
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}
