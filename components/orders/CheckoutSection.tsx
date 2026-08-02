'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface DocumentItem {
  id: string
  kind: string
  url: string
}

export default function CheckoutSection({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: string
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const checkoutResult = searchParams.get('checkout') // "success" | "cancelled" | null

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
    return <p style={{ marginTop: 24 }}>Working…</p>
  }

  if (error) {
    return (
      <div style={{ marginTop: 24 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={handlePay} style={payButtonStyle}>
          Try again
        </button>
      </div>
    )
  }

  if (documents) {
    return (
      <div style={{ marginTop: 24 }}>
        <h2>Your Documents</h2>
        <ul>
          {documents.map((d) => (
            <li key={d.id}>
              <a href={d.url} target="_blank" rel="noopener noreferrer">
                {d.kind === 'official_form' ? 'Official Application (PDF)' : 'Hearing Evidence Packet (PDF)'}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={() => router.push(`/account/save?from=checkout`)} style={payButtonStyle}>
          Save your account
        </button>
      </div>
    )
  }

  if (checkoutResult === 'cancelled') {
    return (
      <div style={{ marginTop: 24 }}>
        <p>Checkout was cancelled — no charge was made.</p>
        <button onClick={handlePay} style={payButtonStyle}>
          Try again — $129
        </button>
      </div>
    )
  }

  if (status === 'intake' || status === 'comps_review') {
    return (
      <div style={{ marginTop: 24 }}>
        <button onClick={handlePay} style={payButtonStyle}>
          Continue — $129
        </button>
      </div>
    )
  }

  return null
}

const payButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: 16,
  fontWeight: 600,
  background: '#2e7d32',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}
