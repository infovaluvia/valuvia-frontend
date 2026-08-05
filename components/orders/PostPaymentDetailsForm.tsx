'use client'

import { useState } from 'react'
import { apiFetch, apiFetchUpload } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import MoneyInput from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'

interface ConditionObservation {
  item: string
  observation: string
}

// Shown once, right after payment succeeds — everything here is
// optional. The goal is a single page: confirm (or skip) an opinion of
// value, note any condition issues, attach photos, then generate. None
// of this blocks the purchase itself, which already happened.
//
// Generating does NOT deliver the package immediately — the backend
// requires a human QA reviewer to approve it first (V1 launch spec
// TASK-QA-001), so this only tells the parent "submitted for review,"
// not "here are your documents."
export default function PostPaymentDetailsForm({
  orderId,
  recommendedValueCents,
  onSubmittedForReview,
}: {
  orderId: string
  recommendedValueCents?: number
  onSubmittedForReview: () => void
}) {
  const [opinionOfValue, setOpinionOfValue] = useState(
    recommendedValueCents ? (recommendedValueCents / 100).toFixed(2) : ''
  )
  const [observations, setObservations] = useState<ConditionObservation[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addObservation() {
    setObservations((obs) => [...obs, { item: '', observation: '' }])
  }

  function updateObservation(i: number, field: keyof ConditionObservation, value: string) {
    setObservations((obs) => obs.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)))
  }

  function removeObservation(i: number) {
    setObservations((obs) => obs.filter((_, idx) => idx !== i))
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setPhotos((prev) => [...prev, ...selected].slice(0, 12))
    e.target.value = ''
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleGenerate() {
    setError(null)
    setLoading(true)
    try {
      const opinionDollars = parseFloat(opinionOfValue)
      const hasOpinion = opinionOfValue.trim() && !Number.isNaN(opinionDollars) && opinionDollars > 0
      const cleanObservations = observations.filter((o) => o.item.trim() || o.observation.trim())

      if (hasOpinion || cleanObservations.length > 0) {
        const body: Record<string, unknown> = {}
        if (hasOpinion) body.opinion_of_value_cents = Math.round(opinionDollars * 100)
        if (cleanObservations.length > 0) body.condition_observations = cleanObservations
        await apiFetch(`/api/v1/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(body) })
      }

      if (photos.length > 0) {
        const formData = new FormData()
        for (const photo of photos) formData.append('files', photo)
        await apiFetchUpload(`/api/v1/orders/${orderId}/condition-photos`, formData)
      }

      await apiFetch(`/api/v1/orders/${orderId}/documents/generate`, { method: 'POST' })
      onSubmittedForReview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong generating your package. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-foreground">Payment confirmed — one optional step</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Everything below is optional and strengthens your package, but you can generate it right now
        with just what we already have.
      </p>

      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Your opinion of value (optional)
        </label>
        <MoneyInput value={opinionOfValue} onChange={setOpinionOfValue} />
        <p className="mt-1.5 text-xs text-foreground-muted">
          This goes on your official appeal application.
          {recommendedValueCents
            ? " We've pre-filled our data-driven recommendation based on comparable sales — edit it if you disagree, or leave it blank to fill it in yourself later."
            : ' Leave blank to fill it in yourself later.'}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Property condition (optional)</label>
          <button type="button" onClick={addObservation} className="text-xs font-semibold text-primary hover:underline">
            + Add item
          </button>
        </div>
        <p className="mt-1 text-xs text-foreground-muted">
          Deferred maintenance, non-functional systems, roof/HVAC age, etc. — common grounds for a
          value-reducing adjustment.
        </p>
        {observations.length > 0 && (
          <div className="mt-3 space-y-3">
            {observations.map((obs, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Item (e.g. Roof)"
                  value={obs.item}
                  onChange={(e) => updateObservation(i, 'item', e.target.value)}
                  className="w-2/5"
                />
                <Input
                  type="text"
                  placeholder="Observation"
                  value={obs.observation}
                  onChange={(e) => updateObservation(i, 'observation', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeObservation(i)}
                  className="flex-shrink-0 px-2 text-sm text-foreground-muted hover:text-error"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Property photos (optional)
        </label>
        <p className="mb-2 text-xs text-foreground-muted">
          Interior and exterior photos supporting any condition issues above. Up to 12 photos.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="block w-full text-sm text-foreground-muted file:mr-4 file:rounded-[var(--radius-sm)] file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
        />
        {photos.length > 0 && (
          <ul className="mt-2 space-y-1">
            {photos.map((p, i) => (
              <li key={i} className="flex items-center justify-between text-xs text-foreground-muted">
                {p.name}
                <button type="button" onClick={() => removePhoto(i)} className="text-error hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">{error}</p>
      )}

      <Button onClick={handleGenerate} disabled={loading} size="lg" className="mt-6 w-full">
        {loading ? 'Generating your package…' : 'Generate My Package'}
      </Button>
    </Card>
  )
}
