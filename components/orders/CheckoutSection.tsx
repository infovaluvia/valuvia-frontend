'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface DocumentItem {
  id: string
  kind: string
  url: string
}

export default function CheckoutSection({
  orderId,
  initialStatus,
  checkoutResult,
}: {
  orderId: string
  initialStatus: string
  checkoutResult?: string // "success" | "cancelled" | undefined
}) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus)
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          setDocuments([
            { id: 'official', kind: 'official_form', url: result.official_form_url },
            { id: 'evidence', kind: 'evidence_packet', url: result.evidence_packet_url },
          ])
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
      window.location.href = result.checkout_url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <p className="mt-8 text-center text-sm text-foreground-muted">Working…</p>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
        <Button onClick={handlePay} className="mt-4 w-full">
          Try again
        </Button>
      </div>
    )
  }

  if (documents) {
    return (
      <Card className="mt-8 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Your Documents</h2>
        <ul className="mt-4 space-y-2">
          {documents.map((d) => (
            <li key={d.id}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {d.kind === 'official_form'
                  ? 'Official Application (PDF)'
                  : 'Hearing Evidence Packet (PDF)'}
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

  if (checkoutResult === 'cancelled') {
    return (
      <Card className="mt-8 p-6 text-center md:p-8">
        <p className="text-sm text-foreground-muted">
          Checkout was cancelled — no charge was made.
        </p>
        <Button onClick={handlePay} className="mt-4 w-full">
          Try again — $129
        </Button>
      </Card>
    )
  }

  if (status === 'intake' || status === 'comps_review') {
    return (
      <div className="mt-8">
        <Button onClick={handlePay} size="lg" className="w-full">
          Continue — $129
        </Button>
      </div>
    )
  }

  return null
}
