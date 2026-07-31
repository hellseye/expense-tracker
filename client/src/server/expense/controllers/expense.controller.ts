import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "../services/expense.service";
import { createExpenseSchema, updateExpenseSchema, queryExpenseSchema } from "@/validations/expense.validation";
import { JwtUtils } from "@/utils/jwt";

export class ExpenseController {
  private static getUserId(req: NextRequest): string {
    const token = req.cookies.get("ledger_session")?.value;
    if (!token) {
      throw new Error("Unauthorized session access");
    }
    const payload = JwtUtils.verify(token);
    if (!payload) {
      throw new Error("Unauthorized session access");
    }
    return payload.userId;
  }

  static async list(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      const url = new URL(req.url);
      
      const rawParams = {
        search: url.searchParams.get("search") || undefined,
        categoryId: url.searchParams.get("categoryId") || undefined,
        paymentMethod: url.searchParams.get("paymentMethod") || undefined,
        startDate: url.searchParams.get("startDate") || undefined,
        endDate: url.searchParams.get("endDate") || undefined,
        sortBy: url.searchParams.get("sortBy") || undefined,
        sortOrder: url.searchParams.get("sortOrder") || undefined,
        page: url.searchParams.get("page") || undefined,
        limit: url.searchParams.get("limit") || undefined,
      };

      const validatedFilters = queryExpenseSchema.parse(rawParams);
      const result = await ExpenseService.listExpenses(userId, validatedFilters);

      return NextResponse.json({
        success: true,
        data: result.expenses,
        meta: result.meta,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.errors.map((e: any) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message || "Failed to fetch expenses" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }

  static async create(req: NextRequest) {
    try {
      const userId = this.getUserId(req);
      const body = await req.json();
      const validatedInput = createExpenseSchema.parse(body);

      const expense = await ExpenseService.createExpense(userId, validatedInput);

      return NextResponse.json({
        success: true,
        data: expense,
      }, { status: 201 });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.errors.map((e: any) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message || "Failed to record expense" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }

  static async get(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const userId = this.getUserId(req);
      const { id } = await params;
      const expense = await ExpenseService.getExpenseDetails(id, userId);

      return NextResponse.json({
        success: true,
        data: expense,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to fetch expense details" },
        { status: error.message === "Unauthorized session access" ? 401 : 404 }
      );
    }
  }

  static async update(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const userId = this.getUserId(req);
      const { id } = await params;
      const body = await req.json();
      const validatedInput = updateExpenseSchema.parse(body);

      const updated = await ExpenseService.updateExpense(id, userId, validatedInput);

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.errors.map((e: any) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message || "Failed to update expense" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }

  static async delete(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const userId = this.getUserId(req);
      const { id } = await params;
      await ExpenseService.deleteExpense(id, userId);

      return NextResponse.json({
        success: true,
        data: { message: "Expense transaction deleted successfully" },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete expense" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }
}
