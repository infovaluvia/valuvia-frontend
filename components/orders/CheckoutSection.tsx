'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PostPaymentDetailsForm from '@/components/orders/PostPaymentDetailsForm'

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
  const [showPostPaymentForm, setShowPostPaymentForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (neededTextFields.length > 0) {
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

  if (documents) {
    return (
      <Card className="mt-8 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Your Appeal Package</h2>
        <p className="mt-1 text-sm text-foreground-muted">
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
        <Button onClick={() => router.push(`/account/save?from=checkout`)} className="mt-6 w-full">
          Save your account
        </Button>
      </Card>
    )
  }

  if (showPostPaymentForm) {
    return (
      <PostPaymentDetailsForm
        orderId={orderId}
        recommendedValueCents={recommendedValueCents}
        onGenerated={(docs) => {
          setStatus('documents_generated')
          setDocuments(docs)
        }}
      />
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
