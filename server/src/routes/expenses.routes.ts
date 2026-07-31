import { Router, Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { createExpenseSchema, updateExpenseSchema } from "../validators/expense.validator";

const router = Router();

// GET /api/v1/expenses
router.get("/", async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || undefined;
    const categoryId = (req.query.categoryId as string) || undefined;
    const paymentMethod = (req.query.paymentMethod as any) || undefined;
    const sortBy = (req.query.sortBy as any) || "date";
    const sortOrder = (req.query.sortOrder as any) || "desc";
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);

    const result = await ExpenseService.getExpenses({
      search,
      categoryId,
      paymentMethod,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch expenses" });
  }
});

// POST /api/v1/expenses
router.post("/", async (req: Request, res: Response) => {
  try {
    const validated = createExpenseSchema.parse(req.body);
    const expense = await ExpenseService.createExpense(validated);
    res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
      return;
    }
    res.status(500).json({ success: false, error: error.message || "Failed to create expense" });
  }
});

// PATCH /api/v1/expenses/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateExpenseSchema.parse(req.body);
    const updated = await ExpenseService.updateExpense(id, validated);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
      return;
    }
    res.status(500).json({ success: false, error: error.message || "Failed to update expense" });
  }
});

// DELETE /api/v1/expenses/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await ExpenseService.deleteExpense(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete expense" });
  }
});

export default router;
