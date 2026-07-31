import { Router, Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";

const router = Router();

// GET /api/v1/analytics
router.get("/", async (_req: Request, res: Response) => {
  try {
    const summary = await AnalyticsService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch analytics" });
  }
});

export default router;
