'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PostPaymentDetailsForm from '@/components/orders/PostPaymentDetailsForm'
import ReportOutcomeSection from '@/components/orders/ReportOutcomeSection'

interface DocumentItem {
  kind: string
  label: string
  url: string
}

const TEXT_FIELD_META: Record<string, { label: string; type: string }> = {
  owner_name: { label: 'Owner name', type: 'text' },
  owner_email: { label: 'Owner email', type: 'email' },
}

type AppealOutcome = 'reduced' | 'unchanged' | 'denied' | 'withdrawn'

interface PostPaymentIntake {
  owner_name?: string | null
  owner_email?: string | null
  owner_phone?: string | null
  mailing_street?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_zip?: string | null
  owner_alternate_phone?: string | null
  owner_fax?: string | null
  requests_written_findings?: string | null
  claim_for_refund?: string | null
}

export default function CheckoutSection({
  orderId,
  initialStatus,
  checkoutResult,
  missingFields,
  recommendedValueCents,
  filingFeeCents,
  countyName,
  initialAppealOutcome,
  intake,
}: {
  orderId: string
  initialStatus: string
  checkoutResult?: string // "success" | "cancelled" | undefined
  missingFields: string[]
  recommendedValueCents?: number
  filingFeeCents?: number | null
  countyName?: string | null
  initialAppealOutcome?: AppealOutcome | null
  intake?: PostPaymentIntake
}) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus)
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [showPostPaymentForm, setShowPostPaymentForm] = useState(false)
  const [addingMissingDetails, setAddingMissingDetails] = useState(false)
  // A package generated before the customer filled these in (or before
  // this fix shipped) stays stale forever otherwise -- generate is safe
  // to call again any time after payment (see documents.py), so this
  // just reopens the same optional form and re-generates.
  const hasAnyMissingDetail = Boolean(
    intake &&
      (!intake.mailing_street || !intake.owner_name || !intake.owner_email || !intake.owner_phone ||
        !intake.owner_alternate_phone || !intake.owner_fax || !intake.requests_written_findings ||
        !intake.claim_for_refund)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingReview, setCheckingReview] = useState(false)
  const [stillUnderReview, setStillUnderReview] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [ownerFiled, setOwnerFiled] = useState(initialStatus === 'owner_filed')
  const [reportingFiled, setReportingFiled] = useState(false)

  const filingFeeLabel =
    filingFeeCents != null
      ? (filingFeeCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : 'a separate amount'

  // Only owner_name/owner_email can still be missing by the time this
  // renders (assessed value is required back on the intake page) — the
  // buy button is always visible; clicking it is what reveals these
  // fields, rather than blocking the button from appearing at all.
  // Everything else (opinion of value, condition, photos) is collected
  // AFTER payment, in PostPaymentDetailsForm — it never gates checkout.
  const neededTextFields = missingFields.filter((f) => f in TEXT_FIELD_META)
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadOrShowPostPayment() {
      if (status === 'documents_generated' || status === 'owner_filed') {
        setLoading(true)
        try {
          const docs = await apiFetch(`/api/v1/orders/${orderId}/documents`)
          setDocuments(docs)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load documents')
        } finally {
          setLoading(false)
        }
        return
      }

      // Payment succeeded (or the webhook already flipped status to
      // "paid") — show the one optional post-payment step instead of
      // silently generating right away, so the customer gets a chance
      // to add an opinion of value / condition notes / photos first.
      if (status === 'paid' || (checkoutResult === 'success' && status === 'comps_review')) {
        setShowPostPaymentForm(true)
      }
    }
    loadOrShowPostPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCheckForDocuments() {
    setCheckingReview(true)
    setStillUnderReview(false)
    try {
      const docs = await apiFetch(`/api/v1/orders/${orderId}/documents`)
      if (docs.length > 0) {
        setDocuments(docs)
        setStatus('documents_generated')
      } else {
        setStillUnderReview(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check on your package')
    } finally {
      setCheckingReview(false)
    }
  }

  async function handleReportFiled() {
    setReportingFiled(true)
    setError(null)
    try {
      await apiFetch(`/api/v1/orders/${orderId}/report-filed`, { method: 'POST' })
      setOwnerFiled(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that — please try again.')
    } finally {
      setReportingFiled(false)
    }
  }

  async function handlePay() {
    if (!acknowledged) {
      setError('Please confirm you understand the pricing and filing terms below before continuing.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const result = await apiFetch(`/api/v1/orders/${orderId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ acknowledged: true }),
      })
      window.location.assign(result.checkout_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout')
      setLoading(false)
    }
  }

  function handleBuyClick() {
    if (neededTextFields.length > 0) {
      setShowCompletionForm(true)
      return
    }
    handlePay()
  }

  const acknowledgementCheckbox = (
    <label className="mb-4 flex items-start gap-2.5 text-sm text-foreground-muted">
      <input
        type="checkbox"
        checked={acknowledged}
        onChange={(e) => setAcknowledged(e.target.checked)}
        className="mt-0.5 flex-shrink-0"
      />
      <span>
        I understand the $79 fee is paid to Valuvia only. {countyName || 'My county'}&apos;s
        filing fee ({filingFeeLabel}) is separate and paid directly to the county. Valuvia does
        not file, sign, or submit anything on my behalf — I am responsible for reviewing,
        signing, and filing my own appeal.
      </span>
    </label>
  )

  const guaranteeFinePrint = (
    <p className="mb-4 text-xs text-foreground-muted">
      Full refund of Valuvia&apos;s $79 fee if your appeal doesn&apos;t reduce your assessment —
      see the{' '}
      <a href="/legal/refund" className="text-primary hover:underline">
        Refund Guarantee Policy
      </a>{' '}
      for eligibility and how to claim it.
    </p>
  )

  async function handleCompletionSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    for (const field of neededTextFields) {
      if (!values[field]?.trim()) {
        setError('Please fill in your name and email to continue.')
        return
      }
    }

    setLoading(true)
    try {
      const body: Record<string, string> = {}
      for (const field of neededTextFields) body[field] = values[field].trim()
      await apiFetch(`/api/v1/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(body) })
      await handlePay()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <p className="mt-8 text-center text-sm text-foreground-muted">Working…</p>
    )
  }

  if (documents && addingMissingDetails) {
    return (
      <PostPaymentDetailsForm
        orderId={orderId}
        recommendedValueCents={recommendedValueCents}
        intake={intake}
        onSubmittedForReview={() => {
          setAddingMissingDetails(false)
          setDocuments(null)
          setStatus('qa_pending')
        }}
      />
    )
  }

  if (documents) {
    return (
      <>
      <Card className="mt-8 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Your Appeal Package</h2>
        {hasAnyMissingDetail && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
            Your application is missing some optional details (mailing address, contact info, or
            filing elections).{' '}
            <button
              type="button"
              onClick={() => setAddingMissingDetails(true)}
              className="font-semibold underline"
            >
              Add them now and update your package
            </button>
            .
          </p>
        )}
        {ownerFiled ? (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm font-medium text-success">
            Filed by owner — customer reported. Valuvia did not file this on your behalf; you told
            us you&apos;ve submitted it.
          </p>
        ) : (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-surface-alt px-4 py-3 text-sm font-medium text-foreground">
            Not filed by Valuvia — you review, sign, and submit this yourself. See your Government
            Filing Package below for the submission checklist and deadline.
          </p>
        )}
        <p className="mt-3 text-sm text-foreground-muted">
          We&apos;ve also emailed you these links (with your receipt). Download now, or come back to
          this page any time.
        </p>
        <ul className="mt-4 space-y-2">
          {documents.map((d) => (
            <li key={d.kind}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {d.label}
              </a>
            </li>
          ))}
        </ul>

        {!ownerFiled && (
          <>
            {error && (
              <p className="mt-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}
            <Button
              onClick={handleReportFiled}
              disabled={reportingFiled}
              variant="secondary"
              className="mt-4 w-full"
            >
              {reportingFiled ? 'Saving…' : "I've Filed My Appeal"}
            </Button>
          </>
        )}

        <Button onClick={() => router.push(`/account/save?from=checkout`)} className="mt-6 w-full">
          Save your account
        </Button>
      </Card>

      {ownerFiled && (
        <ReportOutcomeSection orderId={orderId} initialOutcome={initialAppealOutcome ?? null} />
      )}
      </>
    )
  }

  if (showPostPaymentForm) {
    return (
      <PostPaymentDetailsForm
        orderId={orderId}
        recommendedValueCents={recommendedValueCents}
        intake={intake}
        onSubmittedForReview={() => {
          setShowPostPaymentForm(false)
          setStatus('qa_pending')
        }}
      />
    )
  }

  if (status === 'qa_pending') {
    return (
      <Card className="mt-8 p-6 text-center md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Your Package Is Being Reviewed</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Your package has been generated and a member of our team is reviewing it for accuracy
          before it&apos;s released to you. We&apos;ll email you as soon as it&apos;s ready — this
          page will also show it here.
        </p>
        {stillUnderReview && (
          <p className="mt-3 text-sm text-foreground-muted">Still under review — check back soon.</p>
        )}
        {error && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
        <Button onClick={handleCheckForDocuments} disabled={checkingReview} className="mt-5 w-full">
          {checkingReview ? 'Checking…' : 'Check for My Package'}
        </Button>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <p className="mb-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
        {guaranteeFinePrint}
        {acknowledgementCheckbox}
        <Button onClick={handleBuyClick} className="w-full">
          Try again
        </Button>
      </div>
    )
  }

  if (checkoutResult === 'cancelled' && !showCompletionForm) {
    return (
      <Card className="mt-8 p-6 text-center md:p-8">
        <p className="mb-4 text-sm text-foreground-muted">
          Checkout was cancelled — no charge was made.
        </p>
        {guaranteeFinePrint}
        {acknowledgementCheckbox}
        <Button onClick={handleBuyClick} className="w-full">
          Try again — Unlock My Official Appeal Package ($79)
        </Button>
      </Card>
    )
  }

  if (status === 'intake' || status === 'comps_review') {
    if (showCompletionForm) {
      return (
        <Card className="mt-8 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Almost there</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            We need your name and email so we can put them on your appeal application and send you
            your package.
          </p>
          <form onSubmit={handleCompletionSubmit} className="mt-4 space-y-4">
            {neededTextFields.map((field) => {
              const meta = TEXT_FIELD_META[field]
              return (
                <div key={field}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {meta.label}
                    <span className="ml-1 text-error">*</span>
                  </label>
                  <Input
                    type={meta.type}
                    value={values[field] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                    required
                  />
                </div>
              )
            })}
            {guaranteeFinePrint}
            {acknowledgementCheckbox}
            <Button type="submit" size="lg" className="w-full">
              Continue to Payment
            </Button>
          </form>
        </Card>
      )
    }

    return (
      <div className="mt-8">
        {guaranteeFinePrint}
        {acknowledgementCheckbox}
        <Button onClick={handleBuyClick} size="lg" className="w-full">
          Unlock My Official Appeal Package — $79
        </Button>
      </div>
    )
  }

  return null
}
