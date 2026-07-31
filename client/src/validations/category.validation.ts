import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters long").max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color code (e.g. #8B5CF6)"),
  icon: z.string().min(1, "Icon tag name is required"),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
