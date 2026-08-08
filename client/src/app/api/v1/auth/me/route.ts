import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true, image: true, currency: true, theme: true, createdAt: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Authenticated user details retrieved successfully",
      user: dbUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to retrieve user profile" },
      { status: 401 }
    );
  }
}
