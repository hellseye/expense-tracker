import { AuthController } from "@/server/auth/controllers/auth.controller";

export async function POST() {
  return AuthController.logout();
}
