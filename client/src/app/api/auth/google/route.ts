import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(req: NextRequest) {
  let url = "";
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    url = process.env.NEXTAUTH_URL;
  } else if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
    url = process.env.BETTER_AUTH_URL;
  } else {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    url = `${proto}://${host}`;
  }
  return url.replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || clientId === "placeholder" || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      {
        success: false,
        message: "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your client/.env file.",
      },
      { status: 400 }
    );
  }

  // Construct Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", clientId);
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "openid email profile");
  googleAuthUrl.searchParams.append("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
