import { z } from "zod";

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com",
  "mailinator.com",
  "10minutemail.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "getnada.com",
  "guerrillamail.com",
  "sharklasers.com",
]);

export function isLegitEmail(email: string): { isValid: boolean; reason?: string } {
  if (!email || !email.includes("@")) return { isValid: false, reason: "Email must include @ domain" };
  
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return { isValid: false, reason: "Please enter a valid format (e.g. user@gmail.com)" };

  const domain = email.split("@")[1]?.toLowerCase();
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { isValid: false, reason: "Temporary / disposable emails are not allowed" };
  }

  return { isValid: true };
}

export function evaluatePasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  let score = 0;
  if (checks.length) score++;
  if (checks.hasUpper) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  let label = "Weak";
  let color = "#EF4444"; // Red
  if (score === 2) { label = "Fair"; color = "#F59E0B"; } // Yellow
  else if (score === 3) { label = "Good"; color = "#3B82F6"; } // Blue
  else if (score === 4) { label = "Strong"; color = "#10B981"; } // Green

  return { score, label, color, checks };
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .refine((val) => isLegitEmail(val).isValid, {
      message: "Please enter a legitimate email address (e.g. name@domain.com)",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter (A-Z)" })
    .refine((val) => /[0-9]/.test(val), { message: "Password must contain at least one number (0-9)" })
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
      message: "Password must contain at least one special character (!@#$)",
    }),
  currency: z.string().optional().default("INR"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
