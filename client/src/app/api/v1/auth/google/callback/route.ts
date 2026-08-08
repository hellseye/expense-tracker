import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SessionService } from "@/lib/auth/session-service";

function getBaseUrl(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
  if (host && !host.includes("localhost")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = getBaseUrl(req);

  const fallbackRedirect = `${baseUrl}/login`;

  if (error) {
    console.error("Google OAuth error callback:", error);
    return NextResponse.redirect(`${fallbackRedirect}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${fallbackRedirect}?error=missing_auth_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange OAuth code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Failed to exchange Google auth code:", errBody);
      return NextResponse.redirect(`${fallbackRedirect}?error=token_exchange_failed&details=${encodeURIComponent(errBody)}`);
    }

    const tokens = await tokenRes.json();
    const googleAccessToken = tokens.access_token;

    // 2. Fetch user profile from Google UserInfo API
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${fallbackRedirect}?error=profile_fetch_failed`);
    }

    const profile = await userRes.json();
    const email = profile.email;
    const name = profile.name || email.split("@")[0];
    const image = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(`${fallbackRedirect}?error=email_not_provided`);
    }

    // 3. Upsert user in PostgreSQL database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          emailVerified: true,
          currency: "INR",
          theme: "dark",
          passwordHash: "",
        },
      });
      console.log(`Created new OAuth user via Google: ${email}`);
    } else if (image && user.image !== image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image },
      });
    }

    // 4. Create Production Session via SessionService
    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

    const sessionPayload = await SessionService.createSession(user.id, userAgent, ipAddress);

    // 5. Construct success redirect response and set HttpOnly session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set("ledger_session", sessionPayload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || baseUrl.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    console.log(`Google OAuth session created for user: ${email}`);
    return response;
  } catch (err: any) {
    console.error("Google OAuth callback exception:", err?.message || err);
    return NextResponse.redirect(`${fallbackRedirect}?error=auth_internal_error&msg=${encodeURIComponent(err?.message || "unknown")}`);
  }
}
