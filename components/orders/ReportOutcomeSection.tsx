'use client'

import { useState } from 'react'
import { apiFetchUpload } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Outcome = 'reduced' | 'unchanged' | 'denied' | 'withdrawn'

const OUTCOME_OPTIONS: { value: Outcome; label: string }[] = [
  { value: 'reduced', label: 'My assessment was reduced' },
  { value: 'unchanged', label: 'My assessment was not reduced' },
  { value: 'denied', label: 'The appeal was denied/dismissed' },
  { value: 'withdrawn', label: 'I withdrew the appeal' },
]

interface ReportResult {
  refund_claim: { id: string } | null
  refund_claim_ineligible_reason: string | null
}

export default function ReportOutcomeSection({
  orderId,
  initialOutcome,
}: {
  orderId: string
  initialOutcome: Outcome | null
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(initialOutcome)
  const [selected, setSelected] = useState<Outcome | ''>('')
  const [decisionDate, setDecisionDate] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReportResult | null>(null)

  if (outcome) {
    return (
      <Card className="mt-6 p-6">
        <h3 className="text-base font-semibold text-foreground">Appeal Outcome</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          You reported: <b>{OUTCOME_OPTIONS.find((o) => o.value === outcome)?.label}</b>
        </p>
        {result?.refund_claim && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
            Refund claim submitted — we review each claim by hand and will email you a decision
            within 5 business days.
          </p>
        )}
        {result?.refund_claim_ineligible_reason && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-surface-alt px-4 py-3 text-sm text-foreground-muted">
            {result.refund_claim_ineligible_reason}
          </p>
        )}
      </Card>
    )
  }

  const needsDecisionDate = selected === 'unchanged' || selected === 'denied'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) {
      setError('Select what happened with your appeal.')
      return
    }
    if (needsDecisionDate && !decisionDate) {
      setError("Enter the date of the county's decision.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('outcome', selected)
      if (needsDecisionDate) formData.append('decision_date', decisionDate)
      if (proof) formData.append('proof', proof)
      const res = (await apiFetchUpload(`/api/v1/orders/${orderId}/outcome`, formData)) as {
        order: { appeal_outcome: Outcome }
        refund_claim: { id: string } | null
        refund_claim_ineligible_reason: string | null
      }
      setOutcome(res.order.appeal_outcome)
      setResult({ refund_claim: res.refund_claim, refund_claim_ineligible_reason: res.refund_claim_ineligible_reason })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mt-6 p-6">
      <h3 className="text-base font-semibold text-foreground">Report Your Appeal Outcome</h3>
      <p className="mt-1 text-sm text-foreground-muted">
        If the county doesn&apos;t reduce your assessment, you&apos;re covered by our{' '}
        <a href="/legal/refund" className="text-primary hover:underline">
          refund guarantee
        </a>
        . Let us know what happened once you hear back.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {OUTCOME_OPTIONS.map((o) => (
          <label key={o.value} className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="radio"
              name="outcome"
              value={o.value}
              checked={selected === o.value}
              onChange={() => setSelected(o.value)}
            />
            {o.label}
          </label>
        ))}

        {needsDecisionDate && (
          <div className="pt-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Date of the county&apos;s decision
              <span className="ml-1 text-error">*</span>
            </label>
            <Input
              type="date"
              value={decisionDate}
              onChange={(e) => setDecisionDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
            <label className="mb-1.5 mt-3 block text-sm font-medium text-foreground">
              Proof of decision (recommended)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <p className="mt-1 text-xs text-foreground-muted">
              The county's decision notice, or a screenshot of the county portal showing the
              outcome. Refund claims are reviewed by hand against this documentation.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">{error}</p>
        )}

        <Button type="submit" disabled={submitting} variant="secondary" className="w-full">
          {submitting ? 'Saving…' : 'Submit Outcome'}
        </Button>
      </form>
    </Card>
  )
}
