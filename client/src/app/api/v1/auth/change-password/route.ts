import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/validations/auth.validation";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await SessionService.revokeAllUserSessions(user.id);

    return NextResponse.json({
      message: "Password changed successfully. Other sessions revoked for security.",
    });
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
      { message: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
