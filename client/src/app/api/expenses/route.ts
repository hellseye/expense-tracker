import { NextRequest } from "next/server";
import { ExpenseController } from "@/server/expense/controllers/expense.controller";

export async function GET(req: NextRequest) {
  return ExpenseController.list(req);
}

export async function POST(req: NextRequest) {
  return ExpenseController.create(req);
}
