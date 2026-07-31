"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_service_1 = require("../services/category.service");
const category_validator_1 = require("../validators/category.validator");
const router = (0, express_1.Router)();
// GET /api/v1/categories
router.get("/", async (_req, res) => {
    try {
        const categories = await category_service_1.CategoryService.getCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to fetch categories" });
    }
});
// POST /api/v1/categories
router.post("/", async (req, res) => {
    try {
        const validated = category_validator_1.createCategorySchema.parse(req.body);
        const category = await category_service_1.CategoryService.createCategory(validated);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
            return;
        }
        res.status(500).json({ success: false, error: error.message || "Failed to create category" });
    }
});
// PATCH /api/v1/categories/:id
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const validated = category_validator_1.updateCategorySchema.parse(req.body);
        const updated = await category_service_1.CategoryService.updateCategory(id, validated);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ success: false, error: error.errors[0]?.message || "Validation failed" });
            return;
        }
        res.status(500).json({ success: false, error: error.message || "Failed to update category" });
    }
});
// DELETE /api/v1/categories/:id
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await category_service_1.CategoryService.deleteCategory(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to delete category" });
    }
});
exports.default = router;
