import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../services/user.service";
import { JwtUtils } from "@/utils/jwt";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currency: z.string().optional(),
  theme: z.string().optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export class UserController {
  private static getUserId(req: NextRequest): string {
    const token = req.cookies.get("ledger_session")?.value;
    if (!token) {
      throw new Error("Unauthorized session access");
    }
    const payload = JwtUtils.verify(token);
    if (!payload) {
      throw new Error("Unauthorized session access");
    }
    return payload.userId;
  }

  static async get(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      const profile = await UserService.getProfile(userId);
      return NextResponse.json({ success: true, data: profile });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to retrieve profile" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }

  static async update(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      const body = await req.json();
      
      if (body.oldPassword || body.newPassword) {
        // Change password request
        const validated = changePasswordSchema.parse(body);
        await UserService.changePassword(userId, validated.oldPassword, validated.newPassword);
        return NextResponse.json({ success: true, data: { message: "Password updated successfully" } });
      }

      // Profile updates
      const validated = updateProfileSchema.parse(body);
      const updatedUser = await UserService.updateProfile(userId, validated);
      return NextResponse.json({ success: true, data: updatedUser });
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
        { success: false, message: error.message || "Failed to update profile settings" },
        { status: error.message === "Unauthorized session access" ? 401 : 400 }
      );
    }
  }

  static async delete(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      await UserService.deleteUser(userId);
      
      const response = NextResponse.json({ success: true, data: { message: "Account erased successfully" } });
      
      // Revoke session cookie
      response.cookies.set("ledger_session", "", { maxAge: 0, path: "/" });
      
      return response;
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete account" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }
}
