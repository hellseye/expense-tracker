import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "../services/analytics.service";
import { JwtUtils } from "@/utils/jwt";

export class AnalyticsController {
  private static getUserId(req: NextRequest): string {
    const token = req.cookies.get("ledger_session")?.value;
    if (!token) {
      throw new Error("Unauthorized session access");
    }
    const payload = JwtUtils.verify(token);
    if (!payload) {
      throw new Error("Unauthorized session access");
    }
    return payload.userId;
  }

  static async get(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      const analyticsData = await AnalyticsService.getSummary(userId);

      return NextResponse.json({
        success: true,
        data: analyticsData,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to retrieve analytics metrics" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }
}
