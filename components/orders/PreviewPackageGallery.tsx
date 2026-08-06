'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'

interface PreviewSection {
  kind: string
  label: string
  locked: boolean
  image_urls: string[]
}

const LOADING_MESSAGES = [
  'Reading your county’s assessment roll…',
  'Comparing against nearby recent sales…',
  'Building your official application…',
  'Assembling your evidence book…',
  'Almost ready…',
]

// Defined locally rather than passed as a prop -- a Server Component
// can't pass a plain function to a Client Component across the RSC
// boundary (it isn't serializable).
function formatDollars(cents: number | null | undefined) {
  if (cents == null) return 'Data unavailable'
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Preview Before Purchase (V1): generates and shows the customer's
// actual appeal package -- as watermarked, and for the premium
// documents blurred, JPEG images, never a PDF -- before they've paid.
// Deliberately not reviewed by a human first (product decision); the
// final unwatermarked PDF package a customer can actually download
// still goes through the existing post-payment QA-approval gate,
// unchanged.
export default function PreviewPackageGallery({
  orderId,
  estimatedSavingsCents,
  requestedValueCents,
  comparableCount,
}: {
  orderId: string
  estimatedSavingsCents: number | null
  requestedValueCents: number | null
  comparableCount: number
}) {
  const [sections, setSections] = useState<PreviewSection[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    apiFetch(`/api/v1/orders/${orderId}/documents/preview-package`)
      .then((data) => {
        if (!cancelled) setSections(data.sections)
      })
      .catch(() => {
        if (!cancelled) setError('We couldn’t generate your preview package. You can still continue to checkout.')
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  useEffect(() => {
    if (sections) return
    const id = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1))
    }, 4000)
    return () => clearInterval(id)
  }, [sections])

  const totalPages = sections?.reduce((sum, s) => sum + s.image_urls.length, 0) ?? 0

  return (
    <>
      <h2 className="mt-10 text-lg font-semibold text-foreground">Your Appeal Package Preview</h2>

      {!sections && !error && (
        <Card className="mt-4 p-8 text-center">
          <div
            role="status"
            className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-tint border-t-primary"
          />
          <p className="mt-4 text-sm font-medium text-foreground">Generating your appeal package…</p>
          <p className="mt-1 text-xs text-foreground-muted">{LOADING_MESSAGES[messageIndex]}</p>
        </Card>
      )}

      {error && (
        <Card className="mt-4 p-6 text-center text-sm text-foreground-muted">{error}</Card>
      )}

      {sections && (
        <>
          <Card className="mt-4 p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Estimated Savings" value={formatDollars(estimatedSavingsCents)} highlight />
              <Stat label="Recommended Value" value={formatDollars(requestedValueCents)} />
              <Stat label="Comparable Sales" value={String(comparableCount)} />
              <Stat label="Package" value={`${totalPages} Pages`} />
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent-green">
              <CheckCircleIcon />
              Appeal Analysis Completed
            </p>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sections.map((s) => (
              <div key={s.kind} className="relative overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed storage image, not a local/optimizable asset */}
                <img src={s.image_urls[0]} alt={s.label} className="aspect-[8.5/11] w-full object-cover" />
                {s.locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 p-3 text-center">
                    <LockIcon />
                    <span className="text-xs font-semibold text-white">Premium Content</span>
                    <span className="text-[0.7rem] text-white/80">Unlock to continue</span>
                  </div>
                )}
                <p className="border-t border-border bg-surface px-2 py-1.5 text-center text-xs font-medium text-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
            <b>Our commitment:</b> if anything in your package is inaccurate or incomplete because of
            an error on our end, contact support and we&apos;ll fix it or make it right. We can&apos;t
            guarantee the outcome of your county&apos;s independent review — no one honestly can — but
            we stand behind the accuracy of what we generate.
          </p>
        </>
      )}
    </>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-accent-green' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-white">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
