import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "@/server/expense/services/expense.service";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const csvContent = await ExpenseService.exportCSV(user.userId);

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
