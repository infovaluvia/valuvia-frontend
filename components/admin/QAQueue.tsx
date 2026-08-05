'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { QAOrder } from '@/app/admin/qa/page'

interface DocumentItem {
  kind: string
  label: string
  url: string
}

function formatDollars(cents: number | null) {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function QAQueue({
  initialOrders,
  checklistItems,
  checklistVersion,
}: {
  initialOrders: QAOrder[]
  checklistItems: Record<string, string>
  checklistVersion: string
}) {
  const [orders, setOrders] = useState(initialOrders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleApproved(orderId: string) {
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    setExpandedId(null)
  }

  if (orders.length === 0) {
    return (
      <Card className="mt-6 p-6 text-center text-sm text-foreground-muted">
        Nothing waiting on QA review right now.
      </Card>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {order.situs_address ?? 'Address unavailable'}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                {order.owner_name ?? 'Owner unavailable'}
                {order.owner_email && ` · ${order.owner_email}`}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                {order.property_type ?? 'property type unset'} · Assessed{' '}
                {formatDollars(order.assessed_value_cents)} · Market est.{' '}
                {formatDollars(order.requested_value_cents)} · Opinion of value{' '}
                {formatDollars(order.opinion_of_value_cents)}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              {expandedId === order.id ? 'Close' : 'Review'}
            </Button>
          </div>

          {expandedId === order.id && (
            <ReviewPanel
              order={order}
              checklistItems={checklistItems}
              checklistVersion={checklistVersion}
              onApproved={() => handleApproved(order.id)}
            />
          )}
        </Card>
      ))}
    </div>
  )
}

function ReviewPanel({
  order,
  checklistItems,
  checklistVersion,
  onApproved,
}: {
  order: QAOrder
  checklistItems: Record<string, string>
  checklistVersion: string
  onApproved: () => void
}) {
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [docsLoading, setDocsLoading] = useState(true)
  const [docsError, setDocsError] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [reportVersion, setReportVersion] = useState('v1')
  const [notes, setNotes] = useState('')
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch(`/api/v1/admin/orders/${order.id}/documents`)
      .then((docs) => setDocuments(docs))
      .catch((e) => setDocsError(e instanceof Error ? e.message : 'Failed to load documents'))
      .finally(() => setDocsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allChecked = Object.keys(checklistItems).every((key) => checked[key])

  async function handleApprove() {
    setApproving(true)
    setApproveError(null)
    try {
      await apiFetch(`/api/v1/admin/orders/${order.id}/qa/approve`, {
        method: 'POST',
        body: JSON.stringify({
          checklist: checked,
          report_version: reportVersion.trim() || 'v1',
          notes: notes.trim() || undefined,
        }),
      })
      onApproved()
    } catch (e) {
      setApproveError(e instanceof Error ? e.message : 'Approval failed')
      setApproving(false)
    }
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Generated documents
      </p>
      {docsLoading && <p className="mt-2 text-sm text-foreground-muted">Loading…</p>}
      {docsError && <p className="mt-2 text-sm text-error">{docsError}</p>}
      {documents && documents.length === 0 && (
        <p className="mt-2 text-sm text-foreground-muted">No documents found for this order.</p>
      )}
      {documents && documents.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {documents.map((d) => (
            <li key={d.kind}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Required checklist ({checklistVersion})
      </p>
      <div className="mt-2 space-y-2">
        {Object.entries(checklistItems).map(([key, label]) => (
          <label key={key} className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={checked[key] ?? false}
              onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
              className="mt-0.5"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground-muted">
            Report version
          </label>
          <input
            type="text"
            value={reportVersion}
            onChange={(e) => setReportVersion(e.target.value)}
            className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-foreground-muted">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      {approveError && (
        <p className="mt-3 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {approveError}
        </p>
      )}

      <Button
        onClick={handleApprove}
        disabled={!allChecked || approving}
        className="mt-4 w-full"
      >
        {approving ? 'Approving…' : allChecked ? 'Approve for Delivery' : 'Check every item to approve'}
      </Button>
    </div>
  )
}
