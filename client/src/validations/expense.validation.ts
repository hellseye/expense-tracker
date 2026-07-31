import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const createExpenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long").max(100),
  amount: z.number().positive("Amount must be a positive number"),
  expenseDate: z.string().transform((str) => new Date(str)),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CREDIT_CARD),
  categoryId: z.string().min(1, "Category is required"),
  notes: z.string().max(500).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const queryExpenseSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  sortBy: z.enum(["expenseDate", "amount", "title"]).default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type QueryExpenseInput = z.infer<typeof queryExpenseSchema>;
