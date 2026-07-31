"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_service_1 = require("../services/expense.service");
const expense_validator_1 = require("../validators/expense.validator");
const router = (0, express_1.Router)();
// GET /api/v1/expenses
router.get("/", async (req, res) => {
    try {
        const search = req.query.search || undefined;
        const categoryId = req.query.categoryId || undefined;
        const paymentMethod = req.query.paymentMethod || undefined;
        const sortBy = req.query.sortBy || "date";
        const sortOrder = req.query.sortOrder || "desc";
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        const result = await expense_service_1.ExpenseService.getExpenses({
            search,
            categoryId,
            paymentMethod,
            sortBy,
            sortOrder,
            page,
            limit,
        });
        res.json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to fetch expenses" });
    }
});
// POST /api/v1/expenses
router.post("/", async (req, res) => {
    try {
        const validated = expense_validator_1.createExpenseSchema.parse(req.body);
        const expense = await expense_service_1.ExpenseService.createExpense(validated);
        res.status(201).json({ success: true, data: expense });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
            return;
        }
        res.status(500).json({ success: false, error: error.message || "Failed to create expense" });
    }
});
// PATCH /api/v1/expenses/:id
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const validated = expense_validator_1.updateExpenseSchema.parse(req.body);
        const updated = await expense_service_1.ExpenseService.updateExpense(id, validated);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
            return;
        }
        res.status(500).json({ success: false, error: error.message || "Failed to update expense" });
    }
});
// DELETE /api/v1/expenses/:id
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await expense_service_1.ExpenseService.deleteExpense(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to delete expense" });
    }
});
exports.default = router;
