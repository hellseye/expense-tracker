import { prisma } from "@/lib/db/prisma";

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        theme: true,
        image: true,
        createdAt: true,
      },
    });
  }

  static async findPasswordHash(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return user?.passwordHash || null;
  }

  static async updateProfile(id: string, data: { name?: string; email?: string; currency?: string; theme?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        theme: true,
        image: true,
        createdAt: true,
      },
    });
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
