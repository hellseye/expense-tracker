import { prisma } from "../lib/db/prisma";
import { DEFAULT_CATEGORIES } from "../lib/store/demo-store";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";
import { Category } from "../types";

let inMemoryCategories: Category[] = [...DEFAULT_CATEGORIES];

export class CategoryService {
  static async getCategories(userId = "demo_user"): Promise<Category[]> {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { userId },
        include: {
          _count: {
            select: { expenses: true },
          },
        },
        orderBy: { name: "asc" },
      });

      if (dbCategories.length > 0) {
        return dbCategories.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })) as Category[];
      }
      return inMemoryCategories;
    } catch (error) {
      console.warn("Prisma unavailable, using in-memory category store fallback.");
      return inMemoryCategories;
    }
  }

  static async createCategory(input: CreateCategoryInput, userId = "demo_user"): Promise<Category> {
    try {
      const dbCat = await prisma.category.create({
        data: {
          name: input.name,
          color: input.color || "#8B5CF6",
          icon: input.icon || "tag",
          userId,
        },
      });
      return {
        ...dbCat,
        createdAt: dbCat.createdAt.toISOString(),
        updatedAt: dbCat.updatedAt.toISOString(),
      } as Category;
    } catch (error) {
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: input.name,
        color: input.color || "#8B5CF6",
        icon: input.icon || "tag",
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { expenses: 0 },
      };
      inMemoryCategories.push(newCat);
      return newCat;
    }
  }

  static async updateCategory(id: string, input: UpdateCategoryInput, userId = "demo_user"): Promise<Category> {
    try {
      const updated = await prisma.category.update({
        where: { id, userId },
        data: input,
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      } as Category;
    } catch (error) {
      const index = inMemoryCategories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");
      inMemoryCategories[index] = {
        ...inMemoryCategories[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryCategories[index];
    }
  }

  static async deleteCategory(id: string, userId = "demo_user"): Promise<boolean> {
    try {
      await prisma.category.delete({
        where: { id, userId },
      });
      return true;
    } catch (error) {
      inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
      return true;
    }
  }
}
