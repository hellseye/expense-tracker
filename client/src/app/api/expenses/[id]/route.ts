import { NextRequest } from "next/server";
import { ExpenseController } from "@/server/expense/controllers/expense.controller";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return ExpenseController.get(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return ExpenseController.update(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return ExpenseController.delete(req, context);
}
