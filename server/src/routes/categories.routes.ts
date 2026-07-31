import { Router, Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = Router();

// GET /api/v1/categories
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch categories" });
  }
});

// POST /api/v1/categories
router.post("/", async (req: Request, res: Response) => {
  try {
    const validated = createCategorySchema.parse(req.body);
    const category = await CategoryService.createCategory(validated);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
      return;
    }
    res.status(500).json({ success: false, error: error.message || "Failed to create category" });
  }
});

// PATCH /api/v1/categories/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateCategorySchema.parse(req.body);
    const updated = await CategoryService.updateCategory(id, validated);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
      return;
    }
    res.status(500).json({ success: false, error: error.message || "Failed to update category" });
  }
});

// DELETE /api/v1/categories/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await CategoryService.deleteCategory(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete category" });
  }
});

export default router;
