'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { parseCsv, rowsToLeads, type LeadPayload } from '@/lib/leadgen-upload'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

type Step = 'idle' | 'parsed' | 'pushing' | 'done' | 'error'

export default function LeadUploadForm() {
  const [secret, setSecret] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [leads, setLeads] = useState<LeadPayload[]>([])
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ inserted: number } | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError(null)
    if (!f) {
      setLeads([])
      setStep('idle')
      return
    }
    try {
      const text = await f.text()
      const rows = parseCsv(text)
      const parsedLeads = await rowsToLeads(rows)
      setLeads(parsedLeads)
      setStep('parsed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV')
      setStep('error')
    }
  }

  async function handlePush() {
    if (!secret.trim()) {
      setError('Enter the shared secret first (matches the backend\'s LEADGEN_API_SECRET).')
      return
    }
    setStep('pushing')
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/leads/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': secret.trim(),
        },
        body: JSON.stringify({ leads }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`${res.status}: ${body}`)
      }
      const data = await res.json()
      setResult(data)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push failed')
      setStep('error')
    }
  }

  const tierCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const tier = l.lead_tier ?? 'Unknown'
    acc[tier] = (acc[tier] ?? 0) + 1
    return acc
  }, {})

  return (
    <Card className="mt-6 p-6 md:p-8">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Shared secret
        </label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="LEADGEN_API_SECRET"
          autoComplete="off"
          className="h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint"
        />
        <p className="mt-1.5 text-xs text-foreground-muted">
          Not stored anywhere — kept only in this page&apos;s memory for this session, sent
          directly from your browser to the backend on the one request below. Get the real
          value from whoever manages the Railway deployment; it must match the backend&apos;s
          own <code>LEADGEN_API_SECRET</code> environment variable.
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Lead CSV (a <code>*_clean.csv</code> or the master CSV from valuvia-leadgen)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-foreground-muted file:mr-4 file:rounded-[var(--radius-sm)] file:border-0 file:bg-primary-tint file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-tint/80"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {step === 'parsed' && (
        <div className="mt-6 rounded-[var(--radius-sm)] bg-surface-alt px-4 py-3 text-sm text-foreground">
          Parsed <strong>{leads.length}</strong> leads from {file?.name}.{' '}
          {Object.entries(tierCounts)
            .map(([tier, count]) => `${tier}: ${count}`)
            .join(', ')}
          <br />
          Nothing has been sent yet — review the count above, then push.
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
          Pushed successfully. Backend reports {result.inserted} leads inserted/updated. Check{' '}
          <a href="/admin/leads" className="underline">
            Lead Quality
          </a>{' '}
          to see them.
        </div>
      )}

      <Button
        onClick={handlePush}
        disabled={leads.length === 0 || step === 'pushing'}
        className="mt-6"
      >
        {step === 'pushing' ? 'Pushing…' : `Push ${leads.length || ''} leads to backend`}
      </Button>
    </Card>
  )
}
