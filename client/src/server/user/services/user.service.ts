import bcryptjs from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; email?: string; currency?: string; theme?: string }) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }

    return UserRepository.updateProfile(userId, data);
  }

  static async changePassword(userId: string, oldPassword?: string, newPassword?: string) {
    if (!oldPassword || !newPassword) {
      throw new Error("Old password and new password are required");
    }

    const currentHash = await UserRepository.findPasswordHash(userId);
    if (!currentHash) {
      // In case they signed up via OAuth initially
      const salt = await bcryptjs.genSalt(10);
      const newHash = await bcryptjs.hash(newPassword, salt);
      await UserRepository.updatePassword(userId, newHash);
      return;
    }

    const isValid = await bcryptjs.compare(oldPassword, currentHash);
    if (!isValid) {
      throw new Error("Current password verification failed");
    }

    const salt = await bcryptjs.genSalt(10);
    const newHash = await bcryptjs.hash(newPassword, salt);
    await UserRepository.updatePassword(userId, newHash);
  }

  static async deleteUser(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return UserRepository.deleteUser(userId);
  }
}
