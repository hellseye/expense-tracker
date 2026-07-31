import { NextRequest } from "next/server";
import { CategoryController } from "@/server/category/controllers/category.controller";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return CategoryController.update(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return CategoryController.delete(req, context);
}
