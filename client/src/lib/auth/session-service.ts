import { prisma } from "@/lib/db/prisma";
import { PermissionSystem, Permission } from "./permissions";
import { TokenService } from "./token-service";

export interface SessionResponsePayload {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  role: string;
  permissions: Permission[];
}

export class SessionService {
  /**
   * Create a new Session and issue tokens
   */
  static async createSession(
    userId: string,
    userAgentHeader?: string | null,
    ipAddress?: string | null
  ): Promise<SessionResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const refreshToken = TokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        token: refreshToken,
        userId: user.id,
        ipAddress: ipAddress || null,
        userAgent: userAgentHeader || null,
        expiresAt,
      },
    });

    const accessToken = TokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "USER",
    });

    const permissions = PermissionSystem.getPermissionsForRole("USER");

    return {
      message: "Authentication successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      role: "USER",
      permissions,
    };
  }

  /**
   * Inspect current active session by token
   */
  static async getSessionDetails(
    sessionToken: string,
    accessToken?: string | null
  ): Promise<SessionResponsePayload | null> {
    const dbSession = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!dbSession) return null;

    const token = accessToken || TokenService.signAccessToken({
      userId: dbSession.user.id,
      email: dbSession.user.email,
      role: "USER",
    });

    const permissions = PermissionSystem.getPermissionsForRole("USER");

    return {
      message: "Session active",
      accessToken: token,
      refreshToken: sessionToken,
      user: {
        id: dbSession.user.id,
        name: dbSession.user.name,
        email: dbSession.user.email,
        image: dbSession.user.image,
      },
      role: "USER",
      permissions,
    };
  }

  /**
   * Revoke session by token
   */
  static async revokeSession(sessionId: string, userId: string) {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  /**
   * Revoke all sessions for a user
   */
  static async revokeAllUserSessions(userId: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }
}
