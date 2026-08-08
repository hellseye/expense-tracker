import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { AuthService } from "@/server/auth/services/auth.service";
import { JwtUtils } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await AuthService.validateUser(validated);

    const token = JwtUtils.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });

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
