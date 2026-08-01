import { prisma } from "@/lib/db/prisma";
import { CreateExpenseInput, UpdateExpenseInput, QueryExpenseInput } from "@/validations/expense.validation";
import { encryptText, decryptText } from "@/utils/crypto";

export class ExpenseRepository {
  static async findMany(userId: string, filters: QueryExpenseInput) {
    const { page, limit, search, categoryId, paymentMethod, startDate, endDate, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

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

    const [rawItems, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    // Decrypt encrypted title and notes before returning to the controller
    let items = rawItems.map((item) => ({
      ...item,
      title: decryptText(item.title),
      notes: item.notes ? decryptText(item.notes) : item.notes,
    }));

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) || (item.notes && item.notes.toLowerCase().includes(q))
      );
    }

    return { items, total };
  }

  static async findById(id: string, userId: string) {
    const item = await prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!item) return null;

    return {
      ...item,
      title: decryptText(item.title),
      notes: item.notes ? decryptText(item.notes) : item.notes,
    };
  }

  static async create(userId: string, input: CreateExpenseInput) {
    const created = await prisma.expense.create({
      data: {
        userId,
        categoryId: input.categoryId,
        title: encryptText(input.title),
        amount: input.amount,
        expenseDate: input.expenseDate,
        paymentMethod: input.paymentMethod,
        notes: input.notes ? encryptText(input.notes) : null,
      },
      include: { category: true },
    });

    return {
      ...created,
      title: decryptText(created.title),
      notes: created.notes ? decryptText(created.notes) : created.notes,
    };
  }

  static async update(id: string, userId: string, input: UpdateExpenseInput) {
    const updateData: any = {};
    if (input.categoryId) updateData.categoryId = input.categoryId;
    if (input.title) updateData.title = encryptText(input.title);
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.expenseDate) updateData.expenseDate = input.expenseDate;
    if (input.paymentMethod) updateData.paymentMethod = input.paymentMethod;
    if (input.notes !== undefined) updateData.notes = input.notes ? encryptText(input.notes) : null;

    const updated = await prisma.expense.update({
      where: { id, userId },
      data: updateData,
      include: { category: true },
    });

    return {
      ...updated,
      title: decryptText(updated.title),
      notes: updated.notes ? decryptText(updated.notes) : updated.notes,
    };
  }

  static async delete(id: string, userId: string) {
    return prisma.expense.delete({
      where: { id, userId },
    });
  }
}
