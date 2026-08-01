import { RegisterView } from "@/features/auth/register-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Ledger",
  description: "Create a new Ledger account to track your personal expenses.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
