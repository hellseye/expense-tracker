import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "../services/analytics.service";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export class AnalyticsController {
  private static async getUserId(req: NextRequest): Promise<string> {
    const user = await getAuthenticatedUser(req);
    return user.userId;
  }

  static async get(req: NextRequest) {
    try {
      const userId = await this.getUserId(req);
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
