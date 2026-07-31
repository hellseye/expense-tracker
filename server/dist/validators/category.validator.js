"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Category name is required")
        .max(50, "Category name must be under 50 characters"),
    color: zod_1.z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code")
        .default("#8B5CF6"),
    icon: zod_1.z.string().default("tag"),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
