// Simple utility function without external dependencies
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format price with proper decimal places
 */
export function formatPrice(price: number | undefined | null): string {
  if (!price && price !== 0) return 'Contact for pricing';
  return `€${price.toFixed(2)}`;
}
