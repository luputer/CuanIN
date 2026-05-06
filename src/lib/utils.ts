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


export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberInput = (value: string) => {
  if (!value) {
    return "";
  }

  return new Intl.NumberFormat("id-ID").format(Number(value));
};

/**
 * Menghitung estimasi biaya layanan berdasarkan metode pembayaran (Xendit)
 */
export function calculatePaymentFee(methodId: string | null, baseAmount: number): number {
  if (!methodId) return 0;

  switch (methodId) {
    case "qris":
      return Math.round(baseAmount * 0.007); // QRIS 0.7%
    case "shopeepay":
    case "dana":
    case "ovo":
      return Math.round(baseAmount * 0.015); // E-Wallet 1.5%
    case "bca":
    case "bni":
    case "bri":
    case "mandiri":
    case "bsi":
    case "permata":
      return 4000; // Virtual Account flat 4000
    case "alfamart":
      return 5000; // Retail flat 5000
    case "cc":
      return Math.round(baseAmount * 0.029) + 2000; // Credit Card 2.9% + 2000
    default:
      return 0;
  }
}