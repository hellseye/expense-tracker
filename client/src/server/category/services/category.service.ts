import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.validation";
import { prisma } from "@/lib/db/prisma";

export class CategoryService {
  static async listCategories(userId: string) {
    return CategoryRepository.findMany(userId);
  }

  static async createCategory(userId: string, input: CreateCategoryInput) {
    const existing = await CategoryRepository.findByName(input.name, userId);
    if (existing) {
      throw new Error("Category with this name already exists");
    }
    return CategoryRepository.create(userId, input);
  }

  static async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    const category = await CategoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await CategoryRepository.findByName(input.name, userId);
      if (existing) {
        throw new Error("Another category with this name already exists");
      }
    }

    return CategoryRepository.update(id, userId, input);
  }

  static async deleteCategory(id: string, userId: string) {
    const category = await CategoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Restrict deletion if category has associated expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId: id, userId },
    });

    if (expenseCount > 0) {
      throw new Error("Cannot delete category as it contains associated expenses");
    }

    return CategoryRepository.delete(id, userId);
  }
}
