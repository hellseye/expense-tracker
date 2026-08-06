import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validations/auth.validation";
import { AuthService } from "@/server/auth/services/auth.service";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const user = await AuthService.register(validated);
    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    const sessionPayload = await SessionService.createSession(user.id, userAgent, ipAddress);

    const response = NextResponse.json({
      ...sessionPayload,
      message: "Account registered successfully",
    }, { status: 201 });

    // Set HttpOnly, Secure session cookie
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

    const isConflict = error.message?.includes("exists");
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: isConflict ? 409 : 500 }
    );
  }
}
