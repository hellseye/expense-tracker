import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "@/validations/category.validation";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export class CategoryController {
  private static async getUserId(req: NextRequest): Promise<string> {
    const user = await getAuthenticatedUser(req);
    return user.userId;
  }

  static async list(req: NextRequest) {
    try {
      const userId = await this.getUserId(req);
      const categories = await CategoryService.listCategories(userId);

      return NextResponse.json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to fetch categories" },
        { status: error.message === "Unauthorized session access" ? 401 : 500 }
      );
    }
  }

  static async create(req: NextRequest) {
    try {
      const userId = await this.getUserId(req);
      const body = await req.json();
      const validatedInput = createCategorySchema.parse(body);

      const category = await CategoryService.createCategory(userId, validatedInput);

      return NextResponse.json({
        success: true,
        data: category,
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
        { success: false, message: error.message || "Failed to create category" },
        { status: error.message === "Unauthorized session access" ? 401 : 400 }
      );
    }
  }

  static async update(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const userId = await this.getUserId(req);
      const { id } = await params;
      const body = await req.json();
      const validatedInput = updateCategorySchema.parse(body);

      const category = await CategoryService.updateCategory(id, userId, validatedInput);

      return NextResponse.json({
        success: true,
        data: category,
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
        { success: false, message: error.message || "Failed to update category" },
        { status: error.message === "Unauthorized session access" ? 401 : 400 }
      );
    }
  }

  static async delete(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const userId = await this.getUserId(req);
      const { id } = await params;
      await CategoryService.deleteCategory(id, userId);

      return NextResponse.json({
        success: true,
        data: { message: "Category deleted successfully" },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to delete category" },
        { status: error.message === "Unauthorized session access" ? 401 : 400 }
      );
    }
  }
}
