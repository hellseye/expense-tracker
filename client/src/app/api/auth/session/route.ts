import { NextRequest } from "next/server";
import { AuthController } from "@/server/auth/controllers/auth.controller";

export async function GET(req: NextRequest) {
  return AuthController.getSession(req);
}
