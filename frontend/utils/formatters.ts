/**
 * Formats a raw number into human-readable Indian currency format (e.g. ₹50 Lakhs, ₹2.5 Cr)
 */
export function formatIndianCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—'

  if (value >= 10000000) {
    const cr = value / 10000000
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`
  }

  if (value >= 100000) {
    const lakh = value / 100000
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} L`
  }

  if (value >= 1000) {
    const k = value / 1000
    return `₹${k % 1 === 0 ? k : k.toFixed(1)} K`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

/**
 * Formats a budget deal range into a single clean string (e.g. "₹50 L - ₹5 Cr" or "Up to ₹2 Cr")
 */
export function formatDealRange(min: number | null | undefined, max: number | null | undefined): string {
  if (!min && !max) return 'Open / Flexible'
  if (min && max) return `${formatIndianCurrency(min)} – ${formatIndianCurrency(max)}`
  if (min) return `From ${formatIndianCurrency(min)}`
  if (max) return `Up to ${formatIndianCurrency(max)}`
  return '—'
}

/**
 * Format relative time (e.g. 2h ago, 3d ago, Just now)
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * Format date in Indian format
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format number of bedrooms to standard BHK label
 */
export function formatBHK(bedrooms: number | null | undefined): string {
  if (bedrooms === null || bedrooms === undefined) return '—'
  if (bedrooms === 0) return 'Studio'
  if (bedrooms >= 4) return `${bedrooms} BHK+`
  return `${bedrooms} BHK`
}

/**
 * Format square feet area with commas
 */
export function formatSqFt(sqft: number | null | undefined): string {
  if (!sqft) return '—'
  return `${sqft.toLocaleString('en-IN')} sq ft`
}

