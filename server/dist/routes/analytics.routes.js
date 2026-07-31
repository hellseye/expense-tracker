"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const router = (0, express_1.Router)();
// GET /api/v1/analytics
router.get("/", async (_req, res) => {
    try {
        const summary = await analytics_service_1.AnalyticsService.getSummary();
        res.json({ success: true, data: summary });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || "Failed to fetch analytics" });
    }
});
exports.default = router;
