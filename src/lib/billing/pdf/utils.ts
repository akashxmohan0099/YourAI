/**
 * Shared PDF utility helpers for invoice and quote templates
 */

/**
 * Format cents to a dollar string with commas: $1,234.56
 */
export function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return cents < 0 ? `-$${formatted}` : `$${formatted}`
}

/**
 * Format a date string to a human-readable format: "March 13, 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
