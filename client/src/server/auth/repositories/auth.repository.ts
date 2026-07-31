import { prisma } from "@/lib/db/prisma";
import { RegisterInput } from "@/validations/auth.validation";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(input: RegisterInput, hashedPassword: string) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: hashedPassword,
        currency: input.currency || "INR",
        emailVerified: true,
      },
    });
  }
}
