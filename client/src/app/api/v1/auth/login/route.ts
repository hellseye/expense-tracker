import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { AuthService } from "@/server/auth/services/auth.service";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(`[AUTH DEBUG] Login attempt for email: "${body?.email}"`);

    const validated = loginSchema.parse(body);

    const user = await AuthService.validateUser(validated);
    console.log(`[AUTH DEBUG] Password validated for userId: "${user.id}" (${user.email})`);

    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    const sessionPayload = await SessionService.createSession(
      user.id,
      userAgent,
      ipAddress,
      body.deviceId
    );
    console.log(`[AUTH DEBUG] Session created successfully for userId: "${user.id}"`);

    const response = NextResponse.json({
      ...sessionPayload,
      message: "Login successful",
    });

    // Set HttpOnly Refresh Session Cookie
    response.cookies.set("ledger_session", sessionPayload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error(`[AUTH DEBUG ERROR] Login failed:`, error.message || error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Invalid email or password" },
      { status: 401 }
    );
  }
}
