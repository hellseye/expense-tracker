import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: refreshToken },
    });

    if (!dbSession || dbSession.isRevoked || dbSession.expiresAt < new Date()) {
      return NextResponse.json({ message: "Unauthorized or session expired" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, revokeOthers } = body;

    if (revokeOthers) {
      await SessionService.revokeAllUserSessions(dbSession.userId, dbSession.id);
      return NextResponse.json({ message: "All other device sessions revoked successfully" });
    }

    if (!sessionId) {
      return NextResponse.json({ message: "sessionId is required" }, { status: 400 });
    }

    await SessionService.revokeSession(sessionId, dbSession.userId);

    return NextResponse.json({ message: "Target device session revoked successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to revoke session" },
      { status: 500 }
    );
  }
}
