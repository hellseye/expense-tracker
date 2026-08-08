import { NextRequest, NextResponse } from "next/server";
import { JwtUtils } from "@/utils/jwt";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ledger_session")?.value || req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No active session" },
        { status: 401 }
      );
    }

    const payload = JwtUtils.verify(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    // Optionally fetch latest user image/name from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, image: true, currency: true, theme: true },
    }).catch(() => null);

    const userPayload = dbUser || {
      id: payload.userId,
      email: payload.email,
      name: payload.name || "Ledger User",
      image: null,
    };

    return NextResponse.json({
      message: "Session active",
      accessToken: token,
      user: userPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Session verification failed" },
      { status: 401 }
    );
  }
}
