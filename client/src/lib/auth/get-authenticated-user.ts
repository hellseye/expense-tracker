import { NextRequest } from "next/server";
import { JwtUtils } from "@/utils/jwt";

export async function getAuthenticatedUser(req: NextRequest): Promise<{ userId: string; email?: string; name?: string }> {
  // 1. Try Bearer token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = JwtUtils.verify(token);
    if (payload?.userId) {
      return { userId: payload.userId, email: payload.email, name: payload.name };
    }
  }

  // 2. Try ledger_session cookie
  const sessionToken = req.cookies.get("ledger_session")?.value;
  if (sessionToken) {
    const payload = JwtUtils.verify(sessionToken);
    if (payload?.userId) {
      return { userId: payload.userId, email: payload.email, name: payload.name };
    }
  }

  throw new Error("Unauthorized session access");
}
