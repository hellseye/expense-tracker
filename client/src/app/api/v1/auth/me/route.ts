import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/auth/session-service";

export async function GET(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Unauthorized: No active session token" },
        { status: 401 }
      );
    }

    const sessionDetails = await SessionService.getSessionDetails(refreshToken);
    if (!sessionDetails) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid or expired session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ...sessionDetails,
      message: "Authenticated user details retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to retrieve user profile" },
      { status: 401 }
    );
  }
}
