import { prisma } from "@/lib/db/prisma";
import { CreateExpenseInput, UpdateExpenseInput, QueryExpenseInput } from "@/validations/expense.validation";

export class ExpenseRepository {
  static async findMany(userId: string, filters: QueryExpenseInput) {
    const { page, limit, search, categoryId, paymentMethod, startDate, endDate, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { items, total };
  }

  static async findById(id: string, userId: string) {
    return prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  static async create(userId: string, input: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        userId,
        categoryId: input.categoryId,
        title: input.title,
        amount: input.amount,
        expenseDate: input.expenseDate,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      },
      include: { category: true },
    });
  }

  static async update(id: string, userId: string, input: UpdateExpenseInput) {
    return prisma.expense.update({
      where: { id, userId },
      data: {
        categoryId: input.categoryId,
        title: input.title,
        amount: input.amount,
        expenseDate: input.expenseDate,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      },
      include: { category: true },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.expense.delete({
      where: { id, userId },
    });
  }
}
