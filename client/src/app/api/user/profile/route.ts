import { NextRequest } from "next/server";
import { UserController } from "@/server/user/controllers/user.controller";

export async function GET(req: NextRequest) {
  return UserController.get(req);
}

export async function PATCH(req: NextRequest) {
  return UserController.update(req);
}

export async function DELETE(req: NextRequest) {
  return UserController.delete(req);
}
