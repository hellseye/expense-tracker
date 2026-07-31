import { NextRequest } from "next/server";
import { CategoryController } from "@/server/category/controllers/category.controller";

export async function GET(req: NextRequest) {
  return CategoryController.list(req);
}

export async function POST(req: NextRequest) {
  return CategoryController.create(req);
}
