'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { STORAGE_KEY, type Attribution } from '@/lib/attribution'

const TRACKED_PARAMS = ['promo', 'utm_source', 'utm_medium', 'utm_campaign'] as const
const DISMISSED_KEY = 'valuvia_attribution_banner_dismissed'

// Mounted once in the root layout.
//
// 1. Auto-capture: reads promo/utm query params on whatever page a visitor
//    first lands on (e.g. a mail-piece QR code pointing at "/"), not just
//    the intake form -- a visitor can land on the homepage and click
//    through to /appeal/new several clicks later, and the query params
//    don't survive that navigation on their own. First-touch: never
//    overwrites attribution already stored, so a later organic visit
//    doesn't erase which mail piece or ad actually brought them in.
//
// 2. Manual entry: if nothing was auto-captured, shows a small "have a
//    code?" box -- covers the recipient who typed valuvia.net by hand
//    instead of scanning the letter's QR code. Submitting looks the code
//    up via IntakeForm on /appeal/new (this component doesn't call the
//    API itself, just stores the code and navigates).
export default function AttributionCapture() {
  const router = useRouter()
  const pathname = usePathname()
  const [promo, setPromo] = useState<string | null>(null)
  const [showEntry, setShowEntry] = useState(false)
  const [codeInput, setCodeInput] = useState('')

  // Re-runs on every route change, not just first mount -- this component
  // lives in the root layout and never unmounts across client-side
  // navigations, so without `pathname` as a dependency it would never
  // notice localStorage changing (e.g. right after submitCode() below
  // writes to it and pushes to /appeal/new).
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

    if (stored.promo) {
      if (!window.sessionStorage.getItem(DISMISSED_KEY)) {
        setPromo(stored.promo)
        setShowEntry(false)
      }
    } else if (!window.sessionStorage.getItem(DISMISSED_KEY)) {
      setShowEntry(true)
    }
  }, [pathname])

  function dismiss() {
    window.sessionStorage.setItem(DISMISSED_KEY, '1')
    setPromo(null)
    setShowEntry(false)
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ promo: code }))
    router.push(`/appeal/new?code=${encodeURIComponent(code)}`)
  }

  if (promo) {
    return (
      <div className="flex items-center justify-center gap-3 bg-success-tint px-4 py-2 text-sm text-success">
        <span>
          ✓ Promo code <strong>{promo}</strong>{' '}
          recognized — it&apos;ll be attached to your appeal automatically.
        </span>
        <button onClick={dismiss} aria-label="Dismiss" className="text-success/70 hover:text-success">
          ×
        </button>
      </div>
    )
  }

  if (showEntry) {
    return (
      <form
        onSubmit={submitCode}
        className="flex items-center justify-center gap-2 bg-primary-tint px-4 py-2 text-sm"
      >
        <span>Have a reference code from a letter or email?</span>
        <input
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="e.g. 2MWAUA"
          className="h-8 w-32 rounded border border-border bg-surface px-2 text-sm uppercase outline-none focus:border-primary"
          maxLength={6}
        />
        <button type="submit" className="font-medium text-primary hover:underline">
          Go
        </button>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-foreground-muted hover:text-foreground">
          ×
        </button>
      </form>
    )
  }

  return null
}
