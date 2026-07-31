import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely avoiding conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount using Intl.NumberFormat (Defaults to INR ₹).
 */
export function formatCurrency(amount: number, currency = "INR", locale = "en-IN"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `₹${amount.toFixed(2)}`;
  }
}

/**
 * Formats a date into a clean, human-readable format.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns a contextual time-based greeting for the dashboard top bar.
 */
export function getTimeGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 || hour < 4) {
    greeting = "Good Evening";
  }
  return name ? `${greeting}, ${name}` : greeting;
}
