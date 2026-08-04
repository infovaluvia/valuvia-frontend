export const STORAGE_KEY = 'valuvia_attribution'

export type Attribution = {
  promo?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

// Read back what AttributionCapture stored on first landing, if anything.
export function getStoredAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
