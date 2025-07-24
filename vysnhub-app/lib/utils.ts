import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price with proper decimal places
 */
export function formatPrice(price: number | undefined | null): string {
  if (!price && price !== 0) return 'Contact for pricing';
  return `€${price.toFixed(2)}`;
}
