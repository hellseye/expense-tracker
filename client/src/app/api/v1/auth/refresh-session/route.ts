import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value || (await req.json().catch(() => ({}))).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token provided or active session found" },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    const refreshedPayload = await SessionService.refreshSession(refreshToken, userAgent, ipAddress);

    const response = NextResponse.json(refreshedPayload);

    // Set rotated HttpOnly refresh cookie
    response.cookies.set("ledger_session", refreshedPayload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to refresh session" },
      { status: 401 }
    );
  }
}
