import { NextRequest } from "next/server";
import { AuthController } from "@/server/auth/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return AuthController.register(req);
}
