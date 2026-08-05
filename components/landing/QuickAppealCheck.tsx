'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import MoneyInput from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'

type Verdict = 'not_supported' | 'out_of_window' | 'flagged_overassessed' | 'possible_candidate'

interface ScreeningResult {
  verdict: Verdict
  filing_deadline: string | null
}

// Deliberately doesn't just echo the backend's `reasons` text — that
// copy assumes the full intake flow ("we've saved your property"),
// which hasn't happened here. This is a stateless quick-check: nothing
// is persisted until the visitor continues into the real intake form.
const VERDICT_COPY: Record<Verdict, { headline: string; tone: 'good' | 'neutral' | 'bad' }> = {
  possible_candidate: {
    headline: "Your county's filing window is open — worth a closer look.",
    tone: 'good',
  },
  flagged_overassessed: {
    headline: 'Your assessed value jumped more than the law allows — this is worth appealing.',
    tone: 'good',
  },
  out_of_window: {
    headline: "This county's appeal window isn't open right now.",
    tone: 'neutral',
  },
  not_supported: {
    headline: "We don't cover this county yet, but you can still check back.",
    tone: 'neutral',
  },
}

export default function QuickAppealCheck() {
  const [county, setCounty] = useState('')
  const [state, setState] = useState('CA')
  const [assessedValue, setAssessedValue] = useState('')
  const [priorYearValue, setPriorYearValue] = useState('')

  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const assessedDollars = parseFloat(assessedValue)
    if (!county.trim() || !state.trim() || !assessedValue.trim() || Number.isNaN(assessedDollars) || assessedDollars <= 0) {
      setError('Enter your county, state, and assessed value.')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const priorDollars = parseFloat(priorYearValue)
      const response = await apiFetch('/api/v1/screening', {
        method: 'POST',
        body: JSON.stringify({
          county,
          state,
          assessed_value_cents: Math.round(assessedDollars * 100),
          prior_year_assessed_value_cents:
            priorYearValue.trim() && !Number.isNaN(priorDollars) ? Math.round(priorDollars * 100) : undefined,
        }),
      })
      setResult(response)
    } catch {
      setError('Something went wrong checking that county. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-lg font-bold text-foreground">Check in 10 seconds</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        No account, no address needed yet — just your county and assessed value.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="County" required>
            <Input type="text" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Santa Clara" />
          </Field>
          <Field label="State" required>
            <Input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="CA"
            />
          </Field>
        </div>

        <Field label="Current assessed value" required>
          <MoneyInput value={assessedValue} onChange={setAssessedValue} />
        </Field>

        <Field label="Prior year assessed value (optional)">
          <MoneyInput value={priorYearValue} onChange={setPriorYearValue} />
        </Field>

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Checking…' : 'Should I appeal?'}
        </Button>
      </form>

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-[var(--radius-sm)] border p-4 ${
            VERDICT_COPY[result.verdict].tone === 'good'
              ? 'border-accent-green/30 bg-accent-green/10'
              : 'border-border bg-surface-alt'
          }`}
        >
          <p className="text-sm font-semibold text-foreground">{VERDICT_COPY[result.verdict].headline}</p>
          {result.filing_deadline && (
            <p className="mt-1 text-xs text-foreground-muted">Filing deadline: {result.filing_deadline}</p>
          )}
          <Link href="/#start" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Get my full free review →
          </Link>
        </div>
      )}
    </Card>
  )
}
