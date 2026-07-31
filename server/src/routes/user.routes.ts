import { Router, Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";

const router = Router();

// GET /api/v1/user/export
router.get("/export", async (_req: Request, res: Response) => {
  try {
    const csvContent = await ExpenseService.exportCSV();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ledger_expenses_${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to export CSV" });
  }
});

export default router;
