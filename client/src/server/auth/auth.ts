import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    },
  },
  // Map custom fields on the user model (like currency and passwordHash)
  user: {
    additionalFields: {
      currency: {
        type: "string",
        required: false,
        defaultValue: "INR",
      },
      passwordHash: {
        type: "string",
        required: false,
      },
    },
  },
});
