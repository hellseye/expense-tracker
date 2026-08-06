import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";
import { TokenService } from "@/lib/auth/token-service";

export async function GET(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (bearerToken) {
      const payload = TokenService.verifyAccessToken(bearerToken);
      if (payload) {
        const sessionDetails = await SessionService.getSessionDetails(refreshToken || "", bearerToken);
        if (sessionDetails) {
          return NextResponse.json(sessionDetails);
        }
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No active session" },
        { status: 401 }
      );
    }

    const sessionDetails = await SessionService.getSessionDetails(refreshToken);
    if (!sessionDetails) {
      return NextResponse.json(
        { message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json(sessionDetails);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Session verification failed" },
      { status: 401 }
    );
  }
}
