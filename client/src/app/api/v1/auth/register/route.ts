import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validations/auth.validation";
import { AuthService } from "@/server/auth/services/auth.service";
import { JwtUtils } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(`[AUTH LOG] Registration attempt for email: "${body?.email}"`);

    const validated = registerSchema.parse(body);

    const user = await AuthService.register(validated);
    console.log(`[AUTH LOG] User account created in database for userId: "${user.id}" (${user.email})`);

    const token = JwtUtils.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Account registered successfully",
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    }, { status: 201 });

    // Set HttpOnly Session Cookie
    response.cookies.set("ledger_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error(`[AUTH LOG ERROR] Registration failed:`, error.message || error);
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
