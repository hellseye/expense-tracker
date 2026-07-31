import { NextRequest } from "next/server";
import { AnalyticsController } from "@/server/analytics/controllers/analytics.controller";

export async function GET(req: NextRequest) {
  return AnalyticsController.get(req);
}
