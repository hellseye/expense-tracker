import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginInput, RegisterInput } from "@/validations/auth.validation";

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await AuthRepository.findUserByEmail(input.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(input.password, salt);

    return AuthRepository.createUser(input, hashedPassword);
  }

  static async validateUser(input: LoginInput) {
    let user = await AuthRepository.findUserByEmail(input.email);
    
    // Auto-create demo user if missing
    if (!user && input.email === "mayank@ledger.dev") {
      user = await this.register({
        name: "Demo User",
        email: "mayank@ledger.dev",
        password: input.password || "password123",
        currency: "INR",
      });
    }

    if (!user) {
      throw new Error("Account not found with this email. Please sign up first.");
    }

    if (!user.passwordHash) {
      throw new Error("This account was registered using Google SSO. Please click 'Google SSO' to sign in.");
    }

    const isValid = await bcryptjs.compare(input.password, user.passwordHash);
    
    if (!isValid) {
      throw new Error("Incorrect password. Please try again.");
    }

    return user;
  }
}
