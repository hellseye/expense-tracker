import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedUser(req).catch(() => null);

    const body = await req.json();
    const { issueType, description } = body;

    if (!issueType || !description) {
      return NextResponse.json(
        { success: false, error: "Issue type and description are required" },
        { status: 400 }
      );
    }

    const subject = `Ledger issue :- ${issueType}`;
    const userEmail = session?.email || "Anonymous User";
    const userName = session?.name || "Ledger User";

    // Server-side direct email dispatch to Mayank
    const res = await fetch("https://formsubmit.co/ajax/mayankdhanuka899@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        "Issue Category": issueType,
        "Reporter Email": userEmail,
        "Reporter Name": userName,
        "Whole Issue Explanation": description,
        "App Build": "Ledger v1.5.0 Stable (Tahoe Release)",
        "_captcha": "false",
      }),
    });

    const resData = await res.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      data: {
        subject,
        message: "Bug report email sent directly to Mayank",
        resData,
      },
    });
  } catch (error: any) {
    console.error("Bug report route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send bug report" },
      { status: 500 }
    );
  }
}
