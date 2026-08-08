import { NextRequest, NextResponse } from "next/server";
import { JwtUtils } from "@/utils/jwt";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
    }

    const payload = JwtUtils.verify(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Invalid or expired session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const newAccessToken = JwtUtils.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: "Session refreshed successfully",
      accessToken: newAccessToken,
      refreshToken,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Session refresh failed" },
      { status: 401 }
    );
  }
}
