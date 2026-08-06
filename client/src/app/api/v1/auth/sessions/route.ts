import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
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

    const sessions = await SessionService.getUserSessions(dbSession.userId, dbSession.id);

    return NextResponse.json({
      message: "Active device sessions retrieved successfully",
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to list sessions" },
      { status: 500 }
    );
  }
}
