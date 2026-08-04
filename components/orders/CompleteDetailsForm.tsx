'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import MoneyInput from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'

const FIELD_META: Record<string, { label: string; type: string }> = {
  assessed_value_cents: { label: 'Assessed value', type: 'money' },
  owner_name: { label: 'Owner name', type: 'text' },
  owner_email: { label: 'Owner email', type: 'email' },
}

// Shown wherever an order is missing something required before it can be
// paid for and turned into documents — the intake page itself only
// requires an address, so this is where the rest gets collected, right
// when the customer is actually ready to commit.
export default function CompleteDetailsForm({
  orderId,
  missingFields,
  title = 'A few more details before you continue',
}: {
  orderId: string
  missingFields: string[]
  title?: string
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const body: Record<string, unknown> = {}
    for (const field of missingFields) {
      const raw = values[field]?.trim()
      if (!raw) {
        setError('Please fill in all fields.')
        return
      }
      if (field === 'assessed_value_cents') {
        const dollars = parseFloat(raw)
        if (Number.isNaN(dollars) || dollars <= 0) {
          setError('Please enter a valid assessed value.')
          return
        }
        body[field] = Math.round(dollars * 100)
      } else {
        body[field] = raw
      }
    }

    setLoading(true)
    try {
      await apiFetch(`/api/v1/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(body) })
      // Full reload keeps this simple and guarantees every section on the
      // page (recommendation, comps, checkout) reflects the fresh data.
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {missingFields.map((field) => {
          const meta = FIELD_META[field]
          if (!meta) return null
          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {meta.label}
                <span className="ml-1 text-error">*</span>
              </label>
              {meta.type === 'money' ? (
                <MoneyInput
                  value={values[field] ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field]: v }))}
                  required
                />
              ) : (
                <Input
                  type={meta.type}
                  value={values[field] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                  required
                />
              )}
            </div>
          )
        })}

        {error && (
          <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </Card>
  )
}
