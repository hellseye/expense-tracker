import { prisma } from "@/lib/db/prisma";
import { DeviceDetector, DeviceInfo } from "./device-detector";
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
  session: {
    id: string;
    sessionId: string;
    deviceId: string;
    isCurrent: boolean;
    isTrusted: boolean;
    loginTime: string;
    lastActivity: string;
    expiresAt: string;
    device: {
      id: string;
      name: string;
      platform: string;
      browser: string;
      version: string;
      type: string;
    };
  };
}

export class SessionService {
  /**
   * Create a new Session and issue tokens
   */
  static async createSession(
    userId: string,
    userAgentHeader: string | null,
    ipAddress?: string | null,
    clientDeviceId?: string
  ): Promise<SessionResponsePayload> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const device = DeviceDetector.parse(userAgentHeader, clientDeviceId);
    const refreshToken = TokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const dbSession = await prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        deviceId: device.deviceId,
        deviceName: device.name,
        browser: device.browser,
        browserVersion: device.version,
        os: device.platform,
        deviceType: device.type,
        ipAddress: ipAddress || null,
        userAgent: userAgentHeader || null,
        expiresAt,
        loginTime: new Date(),
        lastActivity: new Date(),
        refreshCount: 0,
        isTrusted: false,
        isRevoked: false,
      },
    });

    const accessToken = TokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "USER",
      sessionId: dbSession.id,
    });

    const permissions = PermissionSystem.getPermissionsForRole(user.role);

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
      role: user.role || "USER",
      permissions,
      session: {
        id: dbSession.id,
        sessionId: dbSession.id,
        deviceId: dbSession.deviceId,
        isCurrent: true,
        isTrusted: dbSession.isTrusted,
        loginTime: dbSession.loginTime.toISOString(),
        lastActivity: dbSession.lastActivity.toISOString(),
        expiresAt: dbSession.expiresAt.toISOString(),
        device: {
          id: dbSession.deviceId,
          name: dbSession.deviceName,
          platform: dbSession.os,
          browser: dbSession.browser,
          version: dbSession.browserVersion,
          type: dbSession.deviceType,
        },
      },
    };
  }

  /**
   * Refresh session, rotate tokens, and update lastActivity timestamp
   */
  static async refreshSession(
    sessionToken: string,
    userAgentHeader: string | null,
    ipAddress?: string | null
  ): Promise<SessionResponsePayload> {
    const dbSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!dbSession || dbSession.isRevoked || dbSession.expiresAt < new Date()) {
      throw new Error("Session invalid, revoked, or expired");
    }

    const device = DeviceDetector.parse(userAgentHeader, dbSession.deviceId);
    const newRefreshToken = TokenService.generateRefreshToken();
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const updatedSession = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        sessionToken: newRefreshToken,
        lastActivity: new Date(),
        expiresAt: newExpiresAt,
        refreshCount: dbSession.refreshCount + 1,
        deviceName: device.name,
        browser: device.browser,
        browserVersion: device.version,
        os: device.platform,
        deviceType: device.type,
        ipAddress: ipAddress || dbSession.ipAddress,
        userAgent: userAgentHeader || dbSession.userAgent,
      },
    });

    const accessToken = TokenService.signAccessToken({
      userId: dbSession.user.id,
      email: dbSession.user.email,
      name: dbSession.user.name,
      role: dbSession.user.role || "USER",
      sessionId: updatedSession.id,
    });

    const permissions = PermissionSystem.getPermissionsForRole(dbSession.user.role);

    return {
      message: "Session refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: dbSession.user.id,
        name: dbSession.user.name,
        email: dbSession.user.email,
        image: dbSession.user.image,
      },
      role: dbSession.user.role || "USER",
      permissions,
      session: {
        id: updatedSession.id,
        sessionId: updatedSession.id,
        deviceId: updatedSession.deviceId,
        isCurrent: true,
        isTrusted: updatedSession.isTrusted,
        loginTime: updatedSession.loginTime.toISOString(),
        lastActivity: updatedSession.lastActivity.toISOString(),
        expiresAt: updatedSession.expiresAt.toISOString(),
        device: {
          id: updatedSession.deviceId,
          name: updatedSession.deviceName,
          platform: updatedSession.os,
          browser: updatedSession.browser,
          version: updatedSession.browserVersion,
          type: updatedSession.deviceType,
        },
      },
    };
  }

  /**
   * Inspect current active session by token or session ID
   */
  static async getSessionDetails(
    sessionToken: string,
    accessToken?: string | null
  ): Promise<SessionResponsePayload | null> {
    const dbSession = await prisma.session.findFirst({
      where: {
        sessionToken,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!dbSession) return null;

    const token = accessToken || TokenService.signAccessToken({
      userId: dbSession.user.id,
      email: dbSession.user.email,
      role: dbSession.user.role || "USER",
      sessionId: dbSession.id,
    });

    const permissions = PermissionSystem.getPermissionsForRole(dbSession.user.role);

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
      role: dbSession.user.role || "USER",
      permissions,
      session: {
        id: dbSession.id,
        sessionId: dbSession.id,
        deviceId: dbSession.deviceId,
        isCurrent: true,
        isTrusted: dbSession.isTrusted,
        loginTime: dbSession.loginTime.toISOString(),
        lastActivity: dbSession.lastActivity.toISOString(),
        expiresAt: dbSession.expiresAt.toISOString(),
        device: {
          id: dbSession.deviceId,
          name: dbSession.deviceName,
          platform: dbSession.os,
          browser: dbSession.browser,
          version: dbSession.browserVersion,
          type: dbSession.deviceType,
        },
      },
    };
  }

  /**
   * Get all active multi-device sessions for a user
   */
  static async getUserSessions(userId: string, currentSessionId?: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      sessionId: s.id,
      deviceId: s.deviceId,
      isCurrent: s.id === currentSessionId,
      isTrusted: s.isTrusted,
      loginTime: s.loginTime.toISOString(),
      lastActivity: s.lastActivity.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      device: {
        id: s.deviceId,
        name: s.deviceName,
        platform: s.os,
        browser: s.browser,
        version: s.browserVersion,
        type: s.deviceType,
      },
    }));
  }

  /**
   * Revoke specific session by ID or token
   */
  static async revokeSession(sessionId: string, userId: string) {
    await prisma.session.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Revoke all sessions for a user (optionally keep current session)
   */
  static async revokeAllUserSessions(userId: string, exceptSessionId?: string) {
    await prisma.session.updateMany({
      where: {
        userId,
        id: exceptSessionId ? { not: exceptSessionId } : undefined,
      },
      data: {
        isRevoked: true,
      },
    });
  }
}
