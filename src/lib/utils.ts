import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | bigint) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

/**
 * Formats a number or string into Indonesian currency style with dot separators
 * Example: 10000 -> 10.000
 */
export function formatNumberWithDots(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  const numberValue = typeof value === "string" ? value.replace(/\D/g, "") : value.toString();
  return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Strips all non-digit characters to get an integer value
 * Example: "10.000" -> 10000
 */
export function parseDotsToNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const stripped = value.toString().replace(/\D/g, "");
  return stripped ? parseInt(stripped, 10) : 0;
}
