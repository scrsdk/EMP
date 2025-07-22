/**
 * Utility functions for consistent formatting across server and client
 */

/**
 * Format number with consistent spacing regardless of locale
 * This prevents hydration errors caused by different number formatting
 * between server and client
 */
export function formatNumber(value: number): string {
  // Convert to string and add spaces every 3 digits from the right
  const parts = Math.abs(value).toString().split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Add spaces to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  
  // Add sign if negative
  const sign = value < 0 ? '-' : ''
  
  // Combine parts
  return sign + formattedInteger + (decimalPart ? '.' + decimalPart : '')
}

/**
 * Format number with K/M suffix for large numbers
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return formatNumber(Math.floor(value / 1000000)) + 'M'
  }
  if (value >= 1000) {
    return formatNumber(Math.floor(value / 1000)) + 'k'
  }
  return formatNumber(value)
}

/**
 * Format currency with consistent formatting
 */
export function formatCurrency(value: number, currency: string = ''): string {
  return formatNumber(value) + (currency ? ' ' + currency : '')
}

/**
 * Format percentage with consistent decimal places
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return value.toFixed(decimals) + '%'
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  if (minutes > 0) {
    return `${minutes}м ${secs}с`
  }
  return `${secs}с`
}