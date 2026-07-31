import { prisma } from "@/lib/db/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.validation";

export class CategoryRepository {
  static async findMany(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  }

  static async findByName(name: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        userId,
        name: { equals: name, mode: "insensitive" },
      },
    });
  }

  static async create(userId: string, input: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        userId,
        name: input.name,
        color: input.color,
        icon: input.icon,
      },
    });
  }

  static async update(id: string, userId: string, input: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id, userId },
      data: input,
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.category.delete({
      where: { id, userId },
    });
  }
}
