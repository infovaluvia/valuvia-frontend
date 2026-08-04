'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import MoneyInput from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'

interface DocumentItem {
  kind: string
  label: string
  url: string
}

const TEXT_FIELD_META: Record<string, { label: string; type: string }> = {
  owner_name: { label: 'Owner name', type: 'text' },
  owner_email: { label: 'Owner email', type: 'email' },
}

export default function CheckoutSection({
  orderId,
  initialStatus,
  checkoutResult,
  missingFields,
  recommendedValueCents,
}: {
  orderId: string
  initialStatus: string
  checkoutResult?: string // "success" | "cancelled" | undefined
  missingFields: string[]
  recommendedValueCents?: number
}) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus)
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // owner_name/owner_email/opinion_of_value_cents can still be missing by
  // the time this renders (assessed value is required back on the intake
  // page) — the buy button is always visible; clicking it is what reveals
  // these fields, rather than blocking the button from appearing at all.
  const neededTextFields = missingFields.filter((f) => f in TEXT_FIELD_META)
  const needsOpinionOfValue = missingFields.includes('opinion_of_value_cents')
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [opinionOfValue, setOpinionOfValue] = useState('')

  // Pre-fill with Valuvia's recommended figure (from comps) the moment
  // it's available — most customers just accept it, but it's always
  // editable, and nothing is written to the official form until they
  // explicitly submit this form.
  useEffect(() => {
    if (recommendedValueCents && !opinionOfValue) {
      setOpinionOfValue((recommendedValueCents / 100).toFixed(2))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedValueCents])

  useEffect(() => {
    async function loadOrGenerate() {
      if (status === 'documents_generated') {
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

      if (checkoutResult === 'success' && (status === 'paid' || status === 'comps_review')) {
        setLoading(true)
        try {
          const result = await apiFetch(`/api/v1/orders/${orderId}/documents/generate`, {
            method: 'POST',
          })
          setStatus('documents_generated')
          setDocuments(result.documents)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Document generation failed')
        } finally {
          setLoading(false)
        }
      }
    }
    loadOrGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePay() {
    setError(null)
    setLoading(true)
    try {
      const result = await apiFetch(`/api/v1/orders/${orderId}/checkout`, { method: 'POST' })
      window.location.assign(result.checkout_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout')
      setLoading(false)
    }
  }

  function handleBuyClick() {
    if (neededTextFields.length > 0 || needsOpinionOfValue) {
      setShowCompletionForm(true)
      return
    }
    handlePay()
  }

  async function handleCompletionSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    for (const field of neededTextFields) {
      if (!values[field]?.trim()) {
        setError('Please fill in your name and email to continue.')
        return
      }
    }
    const opinionDollars = parseFloat(opinionOfValue)
    if (needsOpinionOfValue && (!opinionOfValue.trim() || Number.isNaN(opinionDollars) || opinionDollars <= 0)) {
      setError('Please confirm your opinion of value to continue.')
      return
    }

    setLoading(true)
    try {
      const body: Record<string, string | number> = {}
      for (const field of neededTextFields) body[field] = values[field].trim()
      if (needsOpinionOfValue) {
        body.opinion_of_value_cents = Math.round(opinionDollars * 100)
      }
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

  if (documents) {
    return (
      <Card className="mt-8 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Your Appeal Package</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          We&apos;ve also emailed you these links. Download now, or come back to this page any time.
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
        <Button onClick={() => router.push(`/account/save?from=checkout`)} className="mt-6 w-full">
          Save your account
        </Button>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
        <Button onClick={handleBuyClick} className="mt-4 w-full">
          Try again
        </Button>
      </div>
    )
  }

  if (checkoutResult === 'cancelled' && !showCompletionForm) {
    return (
      <Card className="mt-8 p-6 text-center md:p-8">
        <p className="text-sm text-foreground-muted">
          Checkout was cancelled — no charge was made.
        </p>
        <Button onClick={handleBuyClick} className="mt-4 w-full">
          Try again — I Am Ready to Buy ($79)
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
            We need a few more details so we can put them on your appeal application and send you
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
            {needsOpinionOfValue && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Your opinion of value
                  <span className="ml-1 text-error">*</span>
                </label>
                <MoneyInput value={opinionOfValue} onChange={setOpinionOfValue} />
                <p className="mt-1.5 text-xs text-foreground-muted">
                  This is the figure that goes on your official appeal application as your opinion
                  of your property&apos;s value.
                  {recommendedValueCents
                    ? ` We've pre-filled our data-driven recommendation based on comparable sales — review it and edit it if you disagree.`
                    : ' Enter the value you believe your property is actually worth.'}
                </p>
              </div>
            )}
            <Button type="submit" size="lg" className="w-full">
              Continue to Payment
            </Button>
          </form>
        </Card>
      )
    }

    return (
      <div className="mt-8">
        <Button onClick={handleBuyClick} size="lg" className="w-full">
          I Am Ready to Buy — $79
        </Button>
      </div>
    )
  }

  return null
}
