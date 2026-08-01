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
    const user = await AuthRepository.findUserByEmail(input.email);
    
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcryptjs.compare(input.password, user.passwordHash);
    
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return user;
  }
}
