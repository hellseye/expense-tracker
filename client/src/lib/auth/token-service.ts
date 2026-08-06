import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "ledger_production_quality_jwt_secret_key_2026";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ledger_production_quality_refresh_secret_key_2026";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export class TokenService {
  /**
   * Generate short-lived Access Token (JWT)
   */
  static signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">, expiresInSeconds = 3600): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const expPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const base64Header = this.base64UrlEncode(JSON.stringify(header));
    const base64Payload = this.base64UrlEncode(JSON.stringify(expPayload));
    const signature = this.createSignature(base64Header, base64Payload, JWT_SECRET);

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  /**
   * Verify Access Token (JWT)
   */
  static verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const expectedSignature = this.createSignature(header, payload, JWT_SECRET);

      if (signature !== expectedSignature) return null;

      const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
      const now = Math.floor(Date.now() / 1000);

      if (decodedPayload.exp && now > decodedPayload.exp) {
        return null; // Expired
      }

      return decodedPayload as AccessTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate cryptographically secure Refresh Token string
   */
  static generateRefreshToken(): string {
    return `rt_${crypto.randomBytes(32).toString("hex")}`;
  }

  private static createSignature(header: string, payload: string, secret: string): string {
    return crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf8");
  }
}
