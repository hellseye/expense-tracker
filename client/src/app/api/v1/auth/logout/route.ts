import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;
    const body = await req.json().catch(() => ({}));

    if (refreshToken) {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: refreshToken },
      });

      if (dbSession) {
        if (body.allDevices) {
          await SessionService.revokeAllUserSessions(dbSession.userId);
        } else {
          await SessionService.revokeSession(dbSession.id, dbSession.userId);
        }
      }
    }

    const response = NextResponse.json({
      message: body.allDevices ? "Logged out from all devices successfully" : "Logged out successfully",
    });

    response.cookies.set("ledger_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}
