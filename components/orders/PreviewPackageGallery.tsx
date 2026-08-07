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
  // Which volume + page the enlarged lightbox is currently showing --
  // null means closed. Index into `sections`, not the kind string, so
  // next/prev can walk both the current volume's pages and, once at
  // either end, straight into the next/previous volume.
  const [lightbox, setLightbox] = useState<{ sectionIndex: number; pageIndex: number } | null>(null)

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

  // Steps the lightbox to the next/previous page, crossing into the
  // adjacent volume once the current one's pages run out -- so a
  // reader can flip through the whole package without closing and
  // reopening it volume by volume.
  function step(direction: 1 | -1) {
    setLightbox((current) => {
      if (!current || !sections) return current
      const section = sections[current.sectionIndex]
      const nextPageIndex = current.pageIndex + direction
      if (nextPageIndex >= 0 && nextPageIndex < section.image_urls.length) {
        return { sectionIndex: current.sectionIndex, pageIndex: nextPageIndex }
      }
      const nextSectionIndex = current.sectionIndex + direction
      if (nextSectionIndex < 0 || nextSectionIndex >= sections.length) return current
      const nextSection = sections[nextSectionIndex]
      return {
        sectionIndex: nextSectionIndex,
        pageIndex: direction === 1 ? 0 : nextSection.image_urls.length - 1,
      }
    })
  }

  useEffect(() => {
    if (!lightbox) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, sections])

  const activeSection = lightbox && sections ? sections[lightbox.sectionIndex] : null

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

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sections.map((s) => (
              <div key={s.kind} className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface-alt">
                <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
                  <p className="text-xs font-medium text-foreground">{s.label}</p>
                  {s.locked && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                      <LockIcon />
                      Full copy after purchase
                    </span>
                  )}
                </div>
                {/* The backend already blurs (for locked volumes) and
                    watermarks every page it sends here -- that's the
                    actual "can't file this for free" protection.
                    Covering it with a second, opaque overlay just hides
                    the real preview the customer is supposed to see, so
                    it's shown as-is; up to 3 pages per volume, scrollable
                    on narrow screens, matching MAX_PREVIEW_PAGES on the
                    backend (app/services/preview_render.py). */}
                <div className="flex gap-2 overflow-x-auto p-2">
                  {s.image_urls.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setLightbox({ sectionIndex: sections.indexOf(s), pageIndex: i })}
                      className="group relative flex-shrink-0 rounded-[var(--radius-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`View ${s.label}, page ${i + 1} of ${s.image_urls.length}, enlarged`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed storage image, not a local/optimizable asset */}
                      <img
                        src={url}
                        alt={`${s.label}, page ${i + 1} of ${s.image_urls.length}`}
                        className="aspect-[8.5/11] w-32 rounded-[var(--radius-sm)] border border-border object-cover sm:w-36"
                      />
                      <span className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-sm)] bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                        <ExpandIcon />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
            <b>Our commitment:</b> if anything in your package is inaccurate or incomplete because of
            an error on our end, contact support and we&apos;ll fix it or make it right. We can&apos;t
            guarantee the outcome of your county&apos;s independent review — no one honestly can — but
            we stand behind the accuracy of what we generate.
          </p>

          {lightbox && activeSection && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeSection.label}, page ${lightbox.pageIndex + 1} of ${activeSection.image_urls.length}, enlarged`}
          className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="flex flex-shrink-0 items-center justify-between gap-3 text-white">
            <p className="text-sm font-medium">
              {activeSection.label}
              {activeSection.locked && <span className="ml-2 text-white/60">Full copy after purchase</span>}
              <span className="ml-2 text-white/60">
                — page {lightbox.pageIndex + 1} of {activeSection.image_urls.length}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close enlarged preview"
              className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {(lightbox.sectionIndex > 0 || lightbox.pageIndex > 0) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Previous page"
                className="absolute left-0 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-2"
              >
                <ChevronIcon direction="left" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element -- signed storage image, not a local/optimizable asset */}
            <img
              src={activeSection.image_urls[lightbox.pageIndex]}
              alt={`${activeSection.label}, page ${lightbox.pageIndex + 1} of ${activeSection.image_urls.length}, enlarged`}
              className="max-h-full max-w-full rounded-[var(--radius-sm)] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {(lightbox.sectionIndex < sections.length - 1 ||
              lightbox.pageIndex < activeSection.image_urls.length - 1) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Next page"
                className="absolute right-0 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-2"
              >
                <ChevronIcon direction="right" />
              </button>
            )}
          </div>
        </div>
          )}
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
    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3 flex-shrink-0 text-primary">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 text-white">
      <path
        d="M7 3H3v4M13 3h4v4M17 13v4h-4M3 13v4h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <path
        d={direction === 'left' ? 'M12 4l-6 6 6 6' : 'M8 4l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
