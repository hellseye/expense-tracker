import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "@/server/expense/services/expense.service";
import { JwtUtils } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ledger_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const payload = JwtUtils.verify(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const csvContent = await ExpenseService.exportCSV(payload.userId);

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ledger_expenses_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Export failed" }, { status: 500 });
  }
}
