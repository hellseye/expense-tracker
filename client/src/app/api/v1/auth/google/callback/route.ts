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
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  console.log(`[OAUTH DEBUG] Received Google OAuth Callback. baseUrl: "${baseUrl}", redirectUri: "${redirectUri}", codePresent: ${Boolean(code)}`);

  const fallbackRedirect = `${baseUrl}/login`;

  if (error) {
    console.error("[OAUTH DEBUG ERROR] Google OAuth error callback:", error);
    return NextResponse.redirect(`${fallbackRedirect}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error("[OAUTH DEBUG ERROR] Missing OAuth code parameter");
    return NextResponse.redirect(`${fallbackRedirect}?error=missing_auth_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[OAUTH DEBUG ERROR] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables on server!");
    return NextResponse.redirect(`${fallbackRedirect}?error=missing_google_env_keys`);
  }

  try {
    // 1. Exchange OAuth code for Google access token
    console.log(`[OAUTH DEBUG] Exchanging authorization code with Google token endpoint...`);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("[OAUTH DEBUG ERROR] Failed to exchange Google auth code. Status:", tokenRes.status, "Body:", errBody);
      return NextResponse.redirect(`${fallbackRedirect}?error=token_exchange_failed&details=${encodeURIComponent(errBody)}`);
    }

    const tokens = await tokenRes.json();
    const googleAccessToken = tokens.access_token;

    // 2. Fetch user profile from Google UserInfo API
    console.log(`[OAUTH DEBUG] Google access token received. Fetching user profile from Google UserInfo API...`);
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });

    if (!userRes.ok) {
      console.error("[OAUTH DEBUG ERROR] Failed to fetch Google user profile. Status:", userRes.status);
      return NextResponse.redirect(`${fallbackRedirect}?error=profile_fetch_failed`);
    }

    const profile = await userRes.json();
    const email = profile.email;
    const name = profile.name || email.split("@")[0];
    const image = profile.picture || null;

    console.log(`[OAUTH DEBUG] Google UserInfo retrieved: email="${email}", name="${name}"`);

    if (!email) {
      console.error("[OAUTH DEBUG ERROR] Email not provided by Google UserInfo API");
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
      console.log(`[OAUTH DEBUG] Created new user in database for email: ${email}`);
    } else if (image && user.image !== image) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image },
      });
      console.log(`[OAUTH DEBUG] Updated existing user image in database for email: ${email}`);
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

    console.log(`[OAUTH DEBUG SUCCESS] Google OAuth session created for user: ${email}. Redirecting to /dashboard`);
    return response;
  } catch (err: any) {
    console.error("[OAUTH DEBUG EXCEPTION] Google OAuth callback thrown error:", err?.stack || err?.message || err);
    return NextResponse.redirect(`${fallbackRedirect}?error=auth_internal_error&msg=${encodeURIComponent(err?.message || "unknown")}`);
  }
}
