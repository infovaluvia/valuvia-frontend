'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { getStoredAttribution } from '@/lib/attribution'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

// Combined intake form: creates a property, then creates an order for it.
// Santa Clara only for the initial launch, so jurisdiction_code is fixed
// rather than exposed as a field.
const JURISDICTION_CODE = 'santa-clara'

export default function IntakeForm({
  initialAddress = '',
  lookupCode,
}: {
  initialAddress?: string
  lookupCode?: string
}) {
  const router = useRouter()

  const [situsAddress, setSitusAddress] = useState(initialAddress)
  const [apn, setApn] = useState('')
  const [assessedValue, setAssessedValue] = useState('') // dollars, converted to cents on submit
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [occupied, setOccupied] = useState<'yes' | 'no'>('yes')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(!!lookupCode)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => {
    if (!lookupCode) return
    let cancelled = false
    apiFetch(`/api/v1/mail-campaign/lookup/${encodeURIComponent(lookupCode)}`)
      .then((lead) => {
        if (cancelled) return
        setSitusAddress(lead.situs_address ?? '')
        setApn(lead.apn ?? '')
        if (lead.assessed_value_cents) {
          setAssessedValue((lead.assessed_value_cents / 100).toFixed(2))
        }
        if (lead.owner_name) setOwnerName(lead.owner_name)
        setPrefilled(true)
      })
      .catch(() => {
        if (!cancelled) {
          setLookupError(
            `We couldn't find that code (${lookupCode}). You can still fill in your details below.`
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLookupLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lookupCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const assessedCents = Math.round(parseFloat(assessedValue) * 100)
    if (!assessedCents || assessedCents <= 0) {
      setError('Please enter a valid assessed value.')
      return
    }

    setLoading(true)
    try {
      // Step 1: create the property
      const property = await apiFetch('/api/v1/properties', {
        method: 'POST',
        body: JSON.stringify({
          situs_address: situsAddress,
          apn: apn || undefined,
          jurisdiction_code: JURISDICTION_CODE,
        }),
      })

      // Step 2: create the order for that property
      const attribution = getStoredAttribution()
      const { order } = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          apn: apn || undefined,
          assessed_value_cents: assessedCents,
          owner_name: ownerName,
          owner_email: ownerEmail,
          owner_phone: ownerPhone || undefined,
          occupied,
          filing_status: 'owner',
          attribution_code: attribution.promo,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
        }),
      })

      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[560px] px-6">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
        Step 1 of 2 — Property details
      </p>
      <h1 className="mt-2 text-center text-2xl font-bold text-foreground md:text-3xl">
        Tell us about your property
      </h1>
      <p className="mt-2 text-center text-sm text-foreground-muted">
        Santa Clara County, CA. Takes about 2 minutes.
      </p>

      {lookupLoading && (
        <p className="mt-4 text-center text-sm text-foreground-muted">Looking up your code…</p>
      )}
      {prefilled && !lookupLoading && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-center text-sm text-success">
          We found your property details from your letter — check them below before continuing.
        </p>
      )}
      {lookupError && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-center text-sm text-error">
          {lookupError}
        </p>
      )}

      <Card className="mt-8 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Property address">
            <Input
              type="text"
              value={situsAddress}
              onChange={(e) => setSitusAddress(e.target.value)}
              required
            />
          </Field>

          <Field label="APN (optional)">
            <Input type="text" value={apn} onChange={(e) => setApn(e.target.value)} />
          </Field>

          <Field label="Assessed value ($)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={assessedValue}
              onChange={(e) => setAssessedValue(e.target.value)}
              required
            />
          </Field>

          <Field label="Owner name">
            <Input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </Field>

          <Field label="Owner email">
            <Input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Owner phone (optional)">
            <Input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
          </Field>

          <Field label="Do you live in this property?">
            <select
              value={occupied}
              onChange={(e) => setOccupied(e.target.value as 'yes' | 'no')}
              className="h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>

          {error && (
            <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting…' : 'Get My Estimate'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
