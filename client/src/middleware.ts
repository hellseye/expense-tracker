import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter store (IP -> { count, windowStart })
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const LIMIT = 150; // Max requests
const WINDOW_MS = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
  // CORS & Security Headers setup
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Perform IP Rate Limiting on API endpoints
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const now = Date.now();
    
    const record = rateLimitStore.get(ip);
    if (!record) {
      rateLimitStore.set(ip, { count: 1, windowStart: now });
    } else {
      if (now - record.windowStart < WINDOW_MS) {
        if (record.count >= LIMIT) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: "Too many requests. Please try again later.",
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        record.count += 1;
      } else {
        // Reset window
        record.count = 1;
        record.windowStart = now;
      }
    }

    // CORS headers configuration
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
