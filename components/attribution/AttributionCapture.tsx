'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEY, type Attribution } from '@/lib/attribution'

const TRACKED_PARAMS = ['promo', 'utm_source', 'utm_medium', 'utm_campaign'] as const
const DISMISSED_KEY = 'valuvia_attribution_banner_dismissed'

// Mounted once in the root layout. Captures promo/utm query params on
// whatever page a visitor first lands on (e.g. a mail-piece QR code
// pointing at "/"), not just the intake form -- a visitor can land on the
// homepage and click through to /appeal/new several clicks later, and the
// query params don't survive that navigation on their own.
//
// First-touch: never overwrites attribution already stored for this
// visitor, so a later organic visit doesn't erase which mail piece or ad
// actually brought them in originally.
//
// Also renders a small visible confirmation banner when a promo code was
// recognized, so the visitor gets feedback that it worked -- not just
// silent background tracking.
export default function AttributionCapture() {
  const [promo, setPromo] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const found: Attribution = {}
    for (const key of TRACKED_PARAMS) {
      const value = params.get(key)
      if (value) found[key] = value
    }

    const existingRaw = window.localStorage.getItem(STORAGE_KEY)
    if (Object.keys(found).length > 0 && !existingRaw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    }

    const stored: Attribution = found.promo
      ? found
      : existingRaw
        ? JSON.parse(existingRaw)
        : {}

    if (stored.promo && !window.sessionStorage.getItem(DISMISSED_KEY)) {
      setPromo(stored.promo)
    }
  }, [])

  if (!promo) return null

  function dismiss() {
    window.sessionStorage.setItem(DISMISSED_KEY, '1')
    setPromo(null)
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-success-tint px-4 py-2 text-sm text-success">
      <span>
        ✓ Promo code <strong>{promo}</strong>{' '}
        recognized — it&apos;ll be attached to your appeal automatically.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-success/70 hover:text-success"
      >
        ×
      </button>
    </div>
  )
}
