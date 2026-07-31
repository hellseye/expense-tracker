"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_service_1 = require("../services/expense.service");
const router = (0, express_1.Router)();
// GET /api/v1/user/export
router.get("/export", async (_req, res) => {
    try {
        const csvContent = await expense_service_1.ExpenseService.exportCSV();
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="ledger_expenses_${new Date().toISOString().split("T")[0]}.csv"`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to export CSV" });
    }
});
exports.default = router;
