'use client'

import { useState } from 'react'
import { apiFetch, apiFetchUpload } from '@/lib/api'
import { formatPhoneInput, isIncompletePhone } from '@/lib/phone'
import Card from '@/components/ui/Card'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import MoneyInput from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'

interface ConditionObservation {
  item: string
  observation: string
}

interface PostPaymentIntake {
  owner_name?: string | null
  owner_email?: string | null
  owner_phone?: string | null
  mailing_street?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_zip?: string | null
  owner_alternate_phone?: string | null
  owner_fax?: string | null
  requests_written_findings?: string | null
  claim_for_refund?: string | null
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
  intake,
  onSubmittedForReview,
}: {
  orderId: string
  recommendedValueCents?: number
  intake?: PostPaymentIntake
  onSubmittedForReview: () => void
}) {
  const [opinionOfValue, setOpinionOfValue] = useState(
    recommendedValueCents ? (recommendedValueCents / 100).toFixed(2) : ''
  )
  const [observations, setObservations] = useState<ConditionObservation[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real gap found via live testing: several fields the official
  // application prints never got collected anywhere upstream (mailing
  // address isn't asked for at intake at all; alternate phone/fax and
  // the two written-findings/claim-for-refund elections never had a
  // home either) -- rather than block checkout on them, only ask here,
  // after payment, and only for whichever of these this specific order
  // is still missing.
  const needsMailingAddress = !intake?.mailing_street
  const needsOwnerName = !intake?.owner_name
  const needsOwnerEmail = !intake?.owner_email
  const needsOwnerPhone = !intake?.owner_phone
  const needsAlternatePhone = !intake?.owner_alternate_phone
  const needsFax = !intake?.owner_fax
  const needsWrittenFindings = !intake?.requests_written_findings
  const needsClaimForRefund = !intake?.claim_for_refund
  const hasAnyMissingDetail =
    needsMailingAddress || needsOwnerName || needsOwnerEmail || needsOwnerPhone ||
    needsAlternatePhone || needsFax || needsWrittenFindings || needsClaimForRefund

  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerPhoneTouched, setOwnerPhoneTouched] = useState(false)
  const [mailingStreet, setMailingStreet] = useState('')
  const [mailingCity, setMailingCity] = useState('')
  const [mailingState, setMailingState] = useState('')
  const [mailingZip, setMailingZip] = useState('')
  const [alternatePhone, setAlternatePhone] = useState('')
  const [alternatePhoneTouched, setAlternatePhoneTouched] = useState(false)
  const [fax, setFax] = useState('')
  const [faxTouched, setFaxTouched] = useState(false)
  const [writtenFindings, setWrittenFindings] = useState('')
  const [claimForRefund, setClaimForRefund] = useState('')

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

      const body: Record<string, unknown> = {}
      if (hasOpinion) body.opinion_of_value_cents = Math.round(opinionDollars * 100)
      if (cleanObservations.length > 0) body.condition_observations = cleanObservations
      if (needsOwnerName && ownerName.trim()) body.owner_name = ownerName.trim()
      if (needsOwnerEmail && ownerEmail.trim()) body.owner_email = ownerEmail.trim()
      if (needsOwnerPhone && ownerPhone.trim()) body.owner_phone = ownerPhone.trim()
      if (needsMailingAddress && mailingStreet.trim()) {
        body.mailing_street = mailingStreet.trim()
        if (mailingCity.trim()) body.mailing_city = mailingCity.trim()
        if (mailingState.trim()) body.mailing_state = mailingState.trim()
        if (mailingZip.trim()) body.mailing_zip = mailingZip.trim()
      }
      if (needsAlternatePhone && alternatePhone.trim()) body.owner_alternate_phone = alternatePhone.trim()
      if (needsFax && fax.trim()) body.owner_fax = fax.trim()
      if (needsWrittenFindings && writtenFindings) body.requests_written_findings = writtenFindings
      if (needsClaimForRefund && claimForRefund) body.claim_for_refund = claimForRefund

      if (Object.keys(body).length > 0) {
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

      {hasAnyMissingDetail && (
        <div className="mt-5 rounded-[var(--radius-md)] border border-border bg-surface-alt p-4">
          <p className="text-sm font-medium text-foreground">Fill in anything still missing (optional)</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Your official application prints these if we have them. Leave any of these blank and
            they&apos;ll just be blank on the form — you can also add them yourself later.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {needsOwnerName && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Your name</label>
                <Input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
            )}
            {needsOwnerEmail && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Your email</label>
                <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
            )}
            {needsOwnerPhone && (
              <Field
                label="Daytime phone"
                error={ownerPhoneTouched && isIncompletePhone(ownerPhone) ? 'Enter a 10-digit phone number' : undefined}
              >
                <Input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(formatPhoneInput(e.target.value))}
                  onBlur={() => setOwnerPhoneTouched(true)}
                />
              </Field>
            )}
            {needsAlternatePhone && (
              <Field
                label="Alternate phone"
                error={alternatePhoneTouched && isIncompletePhone(alternatePhone) ? 'Enter a 10-digit phone number' : undefined}
              >
                <Input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(formatPhoneInput(e.target.value))}
                  onBlur={() => setAlternatePhoneTouched(true)}
                />
              </Field>
            )}
            {needsFax && (
              <Field
                label="Fax"
                error={faxTouched && isIncompletePhone(fax) ? 'Enter a 10-digit phone number' : undefined}
              >
                <Input
                  type="tel"
                  value={fax}
                  onChange={(e) => setFax(formatPhoneInput(e.target.value))}
                  onBlur={() => setFaxTouched(true)}
                />
              </Field>
            )}
          </div>

          {needsMailingAddress && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">Mailing address</label>
              <Input
                type="text"
                placeholder="Street address"
                value={mailingStreet}
                onChange={(e) => setMailingStreet(e.target.value)}
              />
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Input
                  type="text"
                  placeholder="City"
                  value={mailingCity}
                  onChange={(e) => setMailingCity(e.target.value)}
                  className="col-span-1"
                />
                <Input
                  type="text"
                  placeholder="State"
                  value={mailingState}
                  onChange={(e) => setMailingState(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="ZIP"
                  value={mailingZip}
                  onChange={(e) => setMailingZip(e.target.value)}
                />
              </div>
            </div>
          )}

          {needsWrittenFindings && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Request written findings of fact? (an extra county fee applies, paid to the county — see
                your application for the amount)
              </label>
              <div className="flex gap-4 text-sm text-foreground">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="written-findings"
                    checked={writtenFindings === 'yes'}
                    onChange={() => setWrittenFindings('yes')}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="written-findings"
                    checked={writtenFindings === 'no'}
                    onChange={() => setWrittenFindings('no')}
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {needsClaimForRefund && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Designate this application as a claim for refund?
              </label>
              <div className="flex gap-4 text-sm text-foreground">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="claim-for-refund"
                    checked={claimForRefund === 'yes'}
                    onChange={() => setClaimForRefund('yes')}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="claim-for-refund"
                    checked={claimForRefund === 'no'}
                    onChange={() => setClaimForRefund('no')}
                  />
                  No
                </label>
              </div>
            </div>
          )}
        </div>
      )}

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
