import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { AuthService } from "@/server/auth/services/auth.service";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await AuthService.validateUser(validated);
    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    const sessionPayload = await SessionService.createSession(
      user.id,
      userAgent,
      ipAddress,
      body.deviceId
    );

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
