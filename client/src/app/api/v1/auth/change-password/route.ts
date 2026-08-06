import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/validations/auth.validation";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { SessionService } from "@/lib/auth/session-service";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("ledger_session")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: refreshToken },
      include: { user: true },
    });

    if (!dbSession || dbSession.isRevoked || dbSession.expiresAt < new Date()) {
      return NextResponse.json({ message: "Unauthorized or session expired" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    if (dbSession.user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, dbSession.user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: dbSession.userId },
      data: { passwordHash: newHash },
    });

    // Optionally revoke all other sessions for security
    await SessionService.revokeAllUserSessions(dbSession.userId, dbSession.id);

    return NextResponse.json({
      message: "Password changed successfully. Other device sessions revoked for security.",
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
