"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../lib/db/prisma");
const demo_store_1 = require("../lib/store/demo-store");
let inMemoryCategories = [...demo_store_1.DEFAULT_CATEGORIES];
class CategoryService {
    static async getCategories(userId = "demo_user") {
        try {
            const dbCategories = await prisma_1.prisma.category.findMany({
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
                }));
            }
            return inMemoryCategories;
        }
        catch (error) {
            console.warn("Prisma unavailable, using in-memory category store fallback.");
            return inMemoryCategories;
        }
    }
    static async createCategory(input, userId = "demo_user") {
        try {
            const dbCat = await prisma_1.prisma.category.create({
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
            };
        }
        catch (error) {
            const newCat = {
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
    static async updateCategory(id, input, userId = "demo_user") {
        try {
            const updated = await prisma_1.prisma.category.update({
                where: { id, userId },
                data: input,
            });
            return {
                ...updated,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
            };
        }
        catch (error) {
            const index = inMemoryCategories.findIndex((c) => c.id === id);
            if (index === -1)
                throw new Error("Category not found");
            inMemoryCategories[index] = {
                ...inMemoryCategories[index],
                ...input,
                updatedAt: new Date().toISOString(),
            };
            return inMemoryCategories[index];
        }
    }
    static async deleteCategory(id, userId = "demo_user") {
        try {
            await prisma_1.prisma.category.delete({
                where: { id, userId },
            });
            return true;
        }
        catch (error) {
            inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
            return true;
        }
    }
}
exports.CategoryService = CategoryService;
