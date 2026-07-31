import type { Metadata } from "next";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger - Minimal Personal Expense Tracker",
  description: "A fast, beautiful, personal finance dashboard inspired by SKLauncher, Linear, Raycast & Notion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-[radial-gradient(circle_at_top_center,_#8b5cf6_0%,_rgba(139,92,246,0.14)_24%,_transparent_48%),linear-gradient(180deg,_#8b5cf6_0%,_#000000_100%)] text-foreground">
        <Providers>{children}</Providers>
      </body>
      {/* <body>
        <Providers>{children}</Providers>
      </body> */}
    </html>
  );
}
