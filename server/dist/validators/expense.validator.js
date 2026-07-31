"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpenseSchema = exports.createExpenseSchema = exports.PaymentMethodEnum = void 0;
const zod_1 = require("zod");
exports.PaymentMethodEnum = zod_1.z.enum([
    "CASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "BANK_TRANSFER",
    "UPI",
    "OTHER",
]);
exports.createExpenseSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be under 100 characters"),
    amount: zod_1.z
        .number({ invalid_type_error: "Amount must be a number" })
        .positive("Amount must be greater than zero"),
    categoryId: zod_1.z.string().min(1, "Category is required"),
    date: zod_1.z.string().min(1, "Date is required"),
    notes: zod_1.z.string().max(500, "Notes must be under 500 characters").optional().nullable(),
    paymentMethod: exports.PaymentMethodEnum.default("CREDIT_CARD"),
});
exports.updateExpenseSchema = exports.createExpenseSchema.partial();
