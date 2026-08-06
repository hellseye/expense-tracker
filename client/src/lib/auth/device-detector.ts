export interface DeviceInfo {
  deviceId: string;
  name: string;
  platform: string;
  browser: string;
  version: string;
  type: "DESKTOP" | "MOBILE" | "TABLET";
}

export class DeviceDetector {
  static parse(userAgentHeader: string | null, clientDeviceId?: string): DeviceInfo {
    const userAgent = userAgentHeader || "";
    
    let browser = "Chrome";
    let version = "1.0";
    let platform = "macOS";
    let type: "DESKTOP" | "MOBILE" | "TABLET" = "DESKTOP";

    // 1. Detect Platform / OS
    if (/iphone/i.test(userAgent)) {
      platform = "iOS";
      type = "MOBILE";
    } else if (/ipad/i.test(userAgent)) {
      platform = "iPadOS";
      type = "TABLET";
    } else if (/android/i.test(userAgent)) {
      platform = "Android";
      type = /mobile/i.test(userAgent) ? "MOBILE" : "TABLET";
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      platform = "macOS";
      type = "DESKTOP";
    } else if (/windows/i.test(userAgent)) {
      platform = "Windows";
      type = "DESKTOP";
    } else if (/linux/i.test(userAgent)) {
      platform = "Linux";
      type = "DESKTOP";
    }

    // 2. Detect Browser & Version
    if (/edg/i.test(userAgent)) {
      browser = "Edge";
      const match = userAgent.match(/edg\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/brave/i.test(userAgent)) {
      browser = "Brave";
      const match = userAgent.match(/chrome\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/arc/i.test(userAgent)) {
      browser = "Arc";
      const match = userAgent.match(/chrome\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/chrome|crios/i.test(userAgent) && !/opr|opera/i.test(userAgent)) {
      browser = "Chrome";
      const match = userAgent.match(/(?:chrome|crios)\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/firefox|fxios/i.test(userAgent)) {
      browser = "Firefox";
      const match = userAgent.match(/(?:firefox|fxios)\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
      browser = "Safari";
      const match = userAgent.match(/version\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    } else if (/opr|opera/i.test(userAgent)) {
      browser = "Opera";
      const match = userAgent.match(/(?:opr|opera)\/([\d.]+)/i);
      if (match) version = match[1].split(".")[0];
    }

    const deviceId = clientDeviceId || `dev_${Math.random().toString(36).substring(2, 11)}`;
    const name = `${browser} on ${platform}`;

    return {
      deviceId,
      name,
      platform,
      browser,
      version,
      type,
    };
  }
}
