'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
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

interface ContactIntake {
  owner_phone?: string | null
  mailing_street?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_zip?: string | null
  owner_alternate_phone?: string | null
  owner_fax?: string | null
}

// UI Redesign Master Plan §6.4/§6.5: property-condition context and the
// package preview/decision should come before checkout, not after --
// previously this same information (opinion of value, condition notes,
// photos) was only collected post-payment via PostPaymentDetailsForm.
// This is purely optional context-gathering: it saves via the same
// order PATCH / photo-upload endpoints PostPaymentDetailsForm uses, but
// never triggers document generation (that still only happens after
// payment, gated the same way it always was).
export default function ConditionIntakeForm({
  orderId,
  recommendedValueCents,
  intake,
}: {
  orderId: string
  recommendedValueCents?: number
  intake?: ContactIntake
}) {
  const [opinionOfValue, setOpinionOfValue] = useState(
    recommendedValueCents ? (recommendedValueCents / 100).toFixed(2) : ''
  )
  const [observations, setObservations] = useState<ConditionObservation[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Real gap found via live testing: mailing address was never
  // collected anywhere, and alternate phone/fax had no home either --
  // these go on the official application, but are entirely optional
  // here (and can still be added post-payment if skipped).
  const [mailingStreet, setMailingStreet] = useState(intake?.mailing_street ?? '')
  const [mailingCity, setMailingCity] = useState(intake?.mailing_city ?? '')
  const [mailingState, setMailingState] = useState(intake?.mailing_state ?? '')
  const [mailingZip, setMailingZip] = useState(intake?.mailing_zip ?? '')
  const [ownerPhone, setOwnerPhone] = useState(formatPhoneInput(intake?.owner_phone ?? ''))
  const [ownerPhoneTouched, setOwnerPhoneTouched] = useState(false)
  const [alternatePhone, setAlternatePhone] = useState(formatPhoneInput(intake?.owner_alternate_phone ?? ''))
  const [alternatePhoneTouched, setAlternatePhoneTouched] = useState(false)
  const [fax, setFax] = useState(formatPhoneInput(intake?.owner_fax ?? ''))
  const [faxTouched, setFaxTouched] = useState(false)

  useEffect(() => {
    track('condition_step_started')
  }, [])

  function addObservation() {
    setObservations((obs) => [...obs, { item: '', observation: '' }])
    setSaved(false)
  }

  function updateObservation(i: number, field: keyof ConditionObservation, value: string) {
    setObservations((obs) => obs.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)))
    setSaved(false)
  }

  function removeObservation(i: number) {
    setObservations((obs) => obs.filter((_, idx) => idx !== i))
    setSaved(false)
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setPhotos((prev) => [...prev, ...selected].slice(0, 12))
    e.target.value = ''
    setSaved(false)
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
    setSaved(false)
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    try {
      const opinionDollars = parseFloat(opinionOfValue)
      const hasOpinion = opinionOfValue.trim() && !Number.isNaN(opinionDollars) && opinionDollars > 0
      const cleanObservations = observations.filter((o) => o.item.trim() || o.observation.trim())

      const body: Record<string, unknown> = {}
      if (hasOpinion) body.opinion_of_value_cents = Math.round(opinionDollars * 100)
      if (cleanObservations.length > 0) body.condition_observations = cleanObservations
      if (mailingStreet.trim()) {
        body.mailing_street = mailingStreet.trim()
        if (mailingCity.trim()) body.mailing_city = mailingCity.trim()
        if (mailingState.trim()) body.mailing_state = mailingState.trim()
        if (mailingZip.trim()) body.mailing_zip = mailingZip.trim()
      }
      if (ownerPhone.trim()) body.owner_phone = ownerPhone.trim()
      if (alternatePhone.trim()) body.owner_alternate_phone = alternatePhone.trim()
      if (fax.trim()) body.owner_fax = fax.trim()

      if (Object.keys(body).length > 0) {
        await apiFetch(`/api/v1/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(body) })
      }

      if (photos.length > 0) {
        const formData = new FormData()
        for (const photo of photos) formData.append('files', photo)
        await apiFetchUpload(`/api/v1/orders/${orderId}/condition-photos`, formData)
        setPhotos([])
      }

      setSaved(true)
      track('condition_step_completed')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong saving this. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-foreground">Additional info (optional)</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Everything below is optional and strengthens your package once you buy it — you can skip
        this and check out now, or add it here first. You can still change it later.
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium text-foreground">Contact details for your application</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Prints on your official appeal application. Leave any of these blank and they&apos;ll
          just be blank on the form.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            label="Daytime phone"
            error={ownerPhoneTouched && isIncompletePhone(ownerPhone) ? 'Enter a 10-digit phone number' : undefined}
          >
            <Input
              type="tel"
              value={ownerPhone}
              onChange={(e) => { setOwnerPhone(formatPhoneInput(e.target.value)); setSaved(false) }}
              onBlur={() => setOwnerPhoneTouched(true)}
            />
          </Field>
          <Field
            label="Alternate phone"
            error={alternatePhoneTouched && isIncompletePhone(alternatePhone) ? 'Enter a 10-digit phone number' : undefined}
          >
            <Input
              type="tel"
              value={alternatePhone}
              onChange={(e) => { setAlternatePhone(formatPhoneInput(e.target.value)); setSaved(false) }}
              onBlur={() => setAlternatePhoneTouched(true)}
            />
          </Field>
          <Field
            label="Fax"
            error={faxTouched && isIncompletePhone(fax) ? 'Enter a 10-digit phone number' : undefined}
          >
            <Input
              type="tel"
              value={fax}
              onChange={(e) => { setFax(formatPhoneInput(e.target.value)); setSaved(false) }}
              onBlur={() => setFaxTouched(true)}
            />
          </Field>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Mailing address</label>
          <Input
            type="text"
            placeholder="Street address"
            value={mailingStreet}
            onChange={(e) => { setMailingStreet(e.target.value); setSaved(false) }}
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Input
              type="text"
              placeholder="City"
              value={mailingCity}
              onChange={(e) => { setMailingCity(e.target.value); setSaved(false) }}
            />
            <Input
              type="text"
              placeholder="State"
              value={mailingState}
              onChange={(e) => { setMailingState(e.target.value); setSaved(false) }}
            />
            <Input
              type="text"
              placeholder="ZIP"
              value={mailingZip}
              onChange={(e) => { setMailingZip(e.target.value); setSaved(false) }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Your opinion of value (optional)
        </label>
        <MoneyInput value={opinionOfValue} onChange={(v) => { setOpinionOfValue(v); setSaved(false) }} />
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
        <p role="alert" className="mt-4 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="mt-4 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
          Saved. You can keep editing or continue to checkout below.
        </p>
      )}

      <Button onClick={handleSave} disabled={loading} variant="secondary" className="mt-6 w-full">
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </Card>
  )
}
