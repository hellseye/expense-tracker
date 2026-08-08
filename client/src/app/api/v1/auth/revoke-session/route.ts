import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    if (body.allDevices) {
      await SessionService.revokeAllUserSessions(authUser.userId);
      return NextResponse.json({ message: "All sessions revoked successfully" });
    }

    if (body.sessionId) {
      await SessionService.revokeSession(body.sessionId, authUser.userId);
      return NextResponse.json({ message: "Session revoked successfully" });
    }

    return NextResponse.json({ message: "Session ID required" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to revoke session" },
      { status: 401 }
    );
  }
}
