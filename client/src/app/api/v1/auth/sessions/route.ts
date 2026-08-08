import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);

    const sessions = await prisma.session.findMany({
      where: {
        userId: authUser.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Active sessions retrieved successfully",
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to list sessions" },
      { status: 401 }
    );
  }
}
