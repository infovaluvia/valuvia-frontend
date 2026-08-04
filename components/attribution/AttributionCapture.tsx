'use client'

import { useEffect } from 'react'
import { STORAGE_KEY } from '@/lib/attribution'

const TRACKED_PARAMS = ['promo', 'utm_source', 'utm_medium', 'utm_campaign'] as const

// Mounted once in the root layout. Captures promo/utm query params on
// whatever page a visitor first lands on (e.g. a mail-piece QR code
// pointing at "/"), not just the intake form -- a visitor can land on the
// homepage and click through to /appeal/new several clicks later, and the
// query params don't survive that navigation on their own.
//
// First-touch: never overwrites attribution already stored for this
// visitor, so a later organic visit doesn't erase which mail piece or ad
// actually brought them in originally.
export default function AttributionCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const key of TRACKED_PARAMS) {
      const value = params.get(key)
      if (value) found[key] = value
    }
    if (Object.keys(found).length === 0) return

    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  }, [])

  return null
}
