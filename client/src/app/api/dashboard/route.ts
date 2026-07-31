import { NextRequest } from "next/server";
import { DashboardController } from "@/server/dashboard/controllers/dashboard.controller";

export async function GET(req: NextRequest) {
  return DashboardController.get(req);
}
