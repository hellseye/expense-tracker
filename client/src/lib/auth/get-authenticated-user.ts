import { NextRequest } from "next/server";
import { TokenService } from "./token-service";
import { JwtUtils } from "@/utils/jwt";
import { prisma } from "@/lib/db/prisma";

export async function getAuthenticatedUser(req: NextRequest): Promise<{ userId: string; email?: string; name?: string; role?: string }> {
  // 1. Try Bearer token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.substring(7);
    const payload = TokenService.verifyAccessToken(accessToken) || JwtUtils.verify(accessToken);
    if (payload?.userId) {
      return { userId: payload.userId, email: payload.email, name: payload.name, role: payload.role };
    }
  }

  // 2. Try ledger_session cookie
  const sessionToken = req.cookies.get("ledger_session")?.value;
  if (sessionToken) {
    // Check if token is a direct JWT
    const jwtPayload = JwtUtils.verify(sessionToken) || TokenService.verifyAccessToken(sessionToken);
    if (jwtPayload?.userId) {
      return { userId: jwtPayload.userId, email: jwtPayload.email, name: jwtPayload.name, role: jwtPayload.role };
    }

    // Otherwise lookup session in database
    const dbSession = await prisma.session.findFirst({
      where: {
        sessionToken,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: { userId: true, user: { select: { email: true, name: true, role: true } } },
    });

    if (dbSession) {
      return {
        userId: dbSession.userId,
        email: dbSession.user.email,
        name: dbSession.user.name,
        role: dbSession.user.role || "USER",
      };
    }
  }

  throw new Error("Unauthorized session access");
}
