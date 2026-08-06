import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from "../services/dashboard.service";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export class DashboardController {
  private static async getUserId(req: NextRequest): Promise<string> {
    const user = await getAuthenticatedUser(req);
    return user.userId;
  }

  static async get(req: NextRequest) {
    try {
      const userId = await this.getUserId(req);
      const dashboardData = await DashboardService.getSummary(userId);

      return NextResponse.json({
        success: true,
        data: dashboardData,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to retrieve dashboard metrics" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }
}
