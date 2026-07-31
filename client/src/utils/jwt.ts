import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "ledger_production_quality_jwt_secret_key_2026";

export class JwtUtils {
  static sign(payload: Record<string, any>, expiresInSeconds = 86400): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const expPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const base64Header = this.base64UrlEncode(JSON.stringify(header));
    const base64Payload = this.base64UrlEncode(JSON.stringify(expPayload));

    const signature = this.createSignature(base64Header, base64Payload);

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  static verify(token: string): Record<string, any> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const expectedSignature = this.createSignature(header, payload);

      if (signature !== expectedSignature) return null;

      const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
      const now = Math.floor(Date.now() / 1000);

      if (decodedPayload.exp && now > decodedPayload.exp) {
        return null; // Token expired
      }

      return decodedPayload;
    } catch {
      return null;
    }
  }

  private static createSignature(header: string, payload: string): string {
    return crypto
      .createHmac("sha256", JWT_SECRET)
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
