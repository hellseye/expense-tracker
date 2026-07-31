import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "@/validations/auth.validation";
import { JwtUtils } from "@/utils/jwt";

export class AuthController {
  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const validated = loginSchema.parse(body);

      const user = await AuthService.validateUser(validated);

      // Sign session JWT token
      const token = JwtUtils.sign({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            currency: user.currency,
          },
        },
      });

      // Set cookie session in response headers
      response.cookies.set("ledger_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400, // 1 day
      });

      return response;
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
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
        {
          success: false,
          message: error.message || "Invalid credentials",
        },
        { status: 401 }
      );
    }
  }

  static async register(req: NextRequest) {
    try {
      const body = await req.json();
      const validated = registerSchema.parse(body);

      const user = await AuthService.register(validated);

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            currency: user.currency,
          },
        },
      }, { status: 201 });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
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
        {
          success: false,
          message: error.message || "Registration failed",
        },
        { status: isConflict ? 409 : 500 }
      );
    }
  }

  static async logout() {
    const response = NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });

    response.cookies.set("ledger_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediately delete
    });

    return response;
  }

  static async getSession(req: NextRequest) {
    const token = req.cookies.get("ledger_session")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No active session" },
        { status: 401 }
      );
    }

    const payload = JwtUtils.verify(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
        },
      },
    });
  }
}
