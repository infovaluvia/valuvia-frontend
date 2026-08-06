'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { apiFetch, apiFetchUpload } from '@/lib/api'
import { loadGooglePlaces, parsePlaceAddressComponents, type ParsedAddress } from '@/lib/google-places'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import MoneyInput, { sanitizeMoneyString } from '@/components/ui/MoneyInput'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import PropertyPhoto from '@/components/intake/PropertyPhoto'
import { COUNTY_ASSESSOR_LINKS, countyToSlug } from '@/lib/county-assessor-links'

// Single-page intake: the only required field is the property address —
// everything else (county/state, assessed value, owner details) is
// optional here and can be filled in later, right before checkout. This
// keeps the first step frictionless; uploading a tax bill (OCR) can fill
// most of it in automatically, or the user can type it all manually.
export default function IntakeForm({
  initialAddress = '',
  initialCode = '',
}: {
  initialAddress?: string
  initialCode?: string
}) {
  const router = useRouter()
  const addressContainerRef = useRef<HTMLDivElement>(null)
  const codeInputId = useId()
  const billUploadId = useId()
  const addressLabelId = useId()

  // A mailer letter carries a per-homeowner code (typed in, or arrived
  // via the QR code's ?code= param) that looks up assessor data already
  // printed on the letter, so they don't have to retype their own
  // address/APN/assessed value. leadCode is threaded through to order
  // creation so the backend can mark it redeemed.
  const [code, setCode] = useState(initialCode.toUpperCase())
  const [leadCode, setLeadCode] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeApplied, setCodeApplied] = useState(false)

  const [situsAddress, setSitusAddress] = useState(initialAddress)
  const [county, setCounty] = useState('')
  const [state, setState] = useState('')
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [placesLib, setPlacesLib] = useState<typeof google.maps.places | null>(null)
  // The address is "confirmed" (shown as a static chip instead of the
  // live search box) once it's been set by a Places selection or by OCR
  // — this is what actually makes autofill visible, since the Places
  // widget below owns its own internal <input> and never reflects our
  // React state directly.
  const [addressConfirmed, setAddressConfirmed] = useState(Boolean(initialAddress))
  // Separate from addressConfirmed: an address can be recognized (from
  // Places, OCR, or a lead code) without the owner having actually said
  // "yes, that's my property" yet. UI Redesign Master Plan §6.2: show a
  // distinct confirmation step ("Is this the property you want to
  // review?") before proceeding, rather than silently treating a
  // recognized address as an implicit confirmation.
  const [propertyConfirmed, setPropertyConfirmed] = useState(false)

  const [apn, setApn] = useState('')
  const [assessedValue, setAssessedValue] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [occupied, setOccupied] = useState<'yes' | 'no'>('yes')
  // Determines whether the official form's "Single Family Residential"
  // property-type box gets checked — left unset here (rather than
  // defaulting to single_family) so a customer with a condo/multi-family/
  // commercial property has to actively notice and answer this, instead
  // of silently getting a form that misstates their property type.
  const [propertyType, setPropertyType] = useState('')

  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  // Ownwell/AppealDesk-style auto-fill: once the property is confirmed,
  // look up the county's assessed value from public records so the
  // customer doesn't have to type it in themselves. Still fully
  // editable below -- county data can lag reality, and the customer is
  // the one signing the appeal application, not this lookup.
  const [assessorLookupLoading, setAssessorLookupLoading] = useState(false)
  const [assessorLookupApplied, setAssessorLookupApplied] = useState(false)
  const [propertyLatLng, setPropertyLatLng] = useState<{ lat: number; lng: number } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const assessorLookupUrl = county ? COUNTY_ASSESSOR_LINKS[countyToSlug(county)] : undefined

  function resetAddress() {
    setAddressConfirmed(false)
    setPropertyConfirmed(false)
    setParsedAddress(null)
    setCodeApplied(false)
    setLeadCode(null)
    setCode('')
    setPropertyLatLng(null)
    setAssessorLookupApplied(false)
  }

  // Fired once, the moment this form is actually reached -- the funnel
  // step between "viewed the landing page" and "submitted an address."
  useEffect(() => {
    track('screening_started')
  }, [])

  // Load the Places library once. Falls back to the plain manual-entry
  // address input below (placesLib stays null) if this fails for any
  // reason -- a network issue, an ad-blocker, or the script simply not
  // loading shouldn't surface as an unhandled promise rejection.
  useEffect(() => {
    let cancelled = false
    loadGooglePlaces()
      .then((places) => {
        if (cancelled || !places) return
        setPlacesLib(places)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Mount a fresh PlaceAutocompleteElement whenever we're in "editing"
  // mode. It's a self-contained custom element (renders and manages its
  // own <input> internally) rather than something bindable to one of our
  // own <Input>s, so each time the user wants to search again (including
  // right after OCR autofill) we tear down and recreate it — otherwise a
  // stale instance could keep showing whatever was typed into it before.
  useEffect(() => {
    if (!placesLib || addressConfirmed || !addressContainerRef.current) return
    const container = addressContainerRef.current
    container.innerHTML = ''
    const element = new placesLib.PlaceAutocompleteElement({ includedRegionCodes: ['us'] })
    element.style.width = '100%'
    container.appendChild(element)
    element.addEventListener('gmp-select', async (e: Event) => {
      const { placePrediction } = e as unknown as google.maps.places.PlaceSelectEvent
      const place = placePrediction.toPlace()
      await place.fetchFields({ fields: ['formattedAddress', 'addressComponents'] })
      if (!place.addressComponents || !place.formattedAddress) return
      const parsed = parsePlaceAddressComponents(place.addressComponents, place.formattedAddress)
      setSitusAddress(parsed.formattedAddress)
      setCounty(parsed.county)
      setState(parsed.state)
      setParsedAddress(parsed)
      setAddressConfirmed(true)
    })
    return () => {
      container.innerHTML = ''
    }
  }, [placesLib, addressConfirmed])

  // Fires once the property is confirmed, skipping if a lead code or
  // tax-bill OCR already supplied an assessed value -- those are more
  // specific/curated sources and shouldn't be silently overwritten by
  // this best-effort county lookup.
  useEffect(() => {
    if (!propertyConfirmed || codeApplied || assessedValue.trim()) return
    let cancelled = false
    setAssessorLookupLoading(true)
    apiFetch(`/api/v1/properties/lookup?address=${encodeURIComponent(situsAddress)}`)
      .then((snapshot) => {
        if (cancelled || !snapshot) return
        if (snapshot.latitude != null && snapshot.longitude != null) {
          setPropertyLatLng({ lat: snapshot.latitude, lng: snapshot.longitude })
        }
        if (!snapshot.assessed_value_cents) return
        setAssessedValue(sanitizeMoneyString((snapshot.assessed_value_cents / 100).toFixed(2)))
        if (snapshot.property_type) setPropertyType(snapshot.property_type)
        setAssessorLookupApplied(true)
      })
      .catch(() => {
        // Best-effort convenience layer -- silently fall back to manual
        // entry, same as when a lead code isn't found.
      })
      .finally(() => {
        if (!cancelled) setAssessorLookupLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyConfirmed])

  async function lookupCode(rawCode: string) {
    const normalized = rawCode.trim().toUpperCase()
    if (!normalized) return
    setCodeError(null)
    setCodeLoading(true)
    try {
      const lead = await apiFetch(`/api/v1/leads/${encodeURIComponent(normalized)}`)
      setSitusAddress(lead.situs_address)
      setAddressConfirmed(true)
      setCounty(lead.county || '')
      setState(lead.state || '')
      const parsed = {
        formattedAddress: lead.situs_address,
        street: '',
        city: '',
        county: lead.county || '',
        state: lead.state || '',
        zip: '',
      }
      setParsedAddress(parsed)
      if (lead.apn) setApn(lead.apn)
      const leadAssessedValue =
        lead.assessed_value_cents != null ? sanitizeMoneyString((lead.assessed_value_cents / 100).toFixed(2)) : ''
      if (leadAssessedValue) setAssessedValue(leadAssessedValue)
      if (lead.owner_name) setOwnerName(lead.owner_name)
      if (lead.owner_email) setOwnerEmail(lead.owner_email)
      if (lead.owner_phone) setOwnerPhone(lead.owner_phone)
      setLeadCode(normalized)
      setCodeApplied(true)

      // V1 launch spec §12 (TASK-FOUND-002): "require the owner to
      // confirm property and assessment facts" -- this used to
      // auto-submit the order immediately after a successful code
      // lookup, with no owner-facing review step at all. Now it only
      // prefills the form; the owner reviews the data below and submits
      // it themselves via the same button every other visitor uses.
    } catch {
      setCodeError("We couldn't find that code — double check your letter, or just fill in the form below.")
    } finally {
      setCodeLoading(false)
    }
  }

  // Auto-redeem when the code arrives via the letter's QR link
  // (?code=... on the homepage) so scanning it requires no typing.
  useEffect(() => {
    if (initialCode.trim()) lookupCode(initialCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleBillUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrError(null)
    setOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { extracted } = await apiFetchUpload('/api/v1/ocr/tax-bill', formData)
      if (extracted.situs_address) {
        setSitusAddress(extracted.situs_address)
        setAddressConfirmed(true)
      }
      if (extracted.county) setCounty(extracted.county)
      if (extracted.state) setState(extracted.state)
      if (extracted.apn) setApn(extracted.apn)
      if (extracted.assessed_value) setAssessedValue(sanitizeMoneyString(extracted.assessed_value))
      if (extracted.owner_name) setOwnerName(extracted.owner_name)
      if (extracted.owner_email) setOwnerEmail(extracted.owner_email)
      if (extracted.county && extracted.state) {
        setParsedAddress({
          formattedAddress: extracted.situs_address || situsAddress,
          street: '',
          city: '',
          county: extracted.county,
          state: extracted.state,
          zip: '',
        })
      }
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Could not read that file. Please enter details manually.')
    } finally {
      setOcrLoading(false)
      e.target.value = ''
    }
  }

  async function submitOrder() {
    setError(null)

    if (!situsAddress.trim()) {
      setError('Please enter your property address.')
      return
    }
    const assessedDollars = parseFloat(assessedValue)
    if (!assessedValue.trim() || Number.isNaN(assessedDollars) || assessedDollars <= 0) {
      setError('Please enter your assessed value — you can find it on your property tax bill or assessment notice.')
      return
    }

    setLoading(true)
    try {
      const assessedCents = Math.round(assessedDollars * 100)

      const property = await apiFetch('/api/v1/properties', {
        method: 'POST',
        body: JSON.stringify({
          situs_address: situsAddress,
          apn: apn || undefined,
          county: county || undefined,
          state: state || undefined,
          parsed_address_json: parsedAddress ?? undefined,
        }),
      })

      const { order } = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          apn: apn || undefined,
          lead_code: leadCode || undefined,
          assessed_value_cents: assessedCents,
          owner_name: ownerName || undefined,
          owner_email: ownerEmail || undefined,
          owner_phone: ownerPhone || undefined,
          occupied,
          filing_status: 'owner',
          property_type: propertyType || undefined,
        }),
      })

      // No address/APN/etc. in the properties -- just the fact that this
      // funnel step happened (V1 launch spec TASK-AN-001: never send a
      // full address or other sensitive value to general analytics).
      track('address_submitted')

      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitOrder()
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <Card className="p-6 md:p-8">
        <div className="mb-6 rounded-[var(--radius-sm)] border border-primary/30 bg-primary-tint p-4">
          {codeApplied ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircleIcon />
                Code applied — we&apos;ve filled in your property details below.
              </span>
              <button
                type="button"
                onClick={resetAddress}
                className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Not your letter?
              </button>
            </div>
          ) : (
            <>
              <label htmlFor={codeInputId} className="mb-2 block text-sm font-medium text-foreground">
                Have a code from your letter?
              </label>
              <p id={`${codeInputId}-hint`} className="mb-3 text-xs text-foreground-muted">
                Enter the code printed on your Valuvia mailer to skip straight to your prefilled
                property details.
              </p>
              <div className="flex gap-2">
                <Input
                  id={codeInputId}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 5UUE7U"
                  className="uppercase tracking-wide"
                  aria-describedby={`${codeInputId}-hint`}
                  aria-invalid={codeError ? true : undefined}
                />
                <Button
                  type="button"
                  onClick={() => lookupCode(code)}
                  disabled={codeLoading || !code.trim()}
                  className="flex-shrink-0"
                >
                  {codeLoading ? 'Looking up…' : 'Apply code'}
                </Button>
              </div>
              {codeError && <p role="alert" className="mt-2 text-xs text-error">{codeError}</p>}
            </>
          )}
        </div>

        <div className="mb-6 rounded-[var(--radius-sm)] border border-border bg-surface-alt p-4">
          <label htmlFor={billUploadId} className="mb-2 block text-sm font-medium text-foreground">
            Upload your tax bill or assessment notice (optional)
          </label>
          <p id={`${billUploadId}-hint`} className="mb-3 text-xs text-foreground-muted">
            We&apos;ll read the address, county, APN, owner name, and assessed value for you —
            you can still edit anything below before continuing.
          </p>
          <input
            id={billUploadId}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleBillUpload}
            disabled={ocrLoading}
            aria-describedby={`${billUploadId}-hint`}
            className="block w-full text-sm text-foreground-muted file:mr-4 file:rounded-[var(--radius-sm)] file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
          />
          {ocrLoading && <p role="status" className="mt-2 text-xs text-foreground-muted">Reading your document…</p>}
          {ocrError && <p role="alert" className="mt-2 text-xs text-error">{ocrError}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label id={addressLabelId} className="mb-1.5 block text-sm font-medium text-foreground">
              Property address
              <span aria-hidden="true" className="ml-1 text-error">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            {addressConfirmed ? (
              <div aria-labelledby={addressLabelId} className="rounded-[var(--radius-sm)] border border-border bg-surface-alt px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircleIcon />
                    {situsAddress}
                  </span>
                  {propertyConfirmed && (
                    <button
                      type="button"
                      onClick={resetAddress}
                      className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
                {!propertyConfirmed && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-sm font-medium text-foreground">
                      Is this the property you want to review?
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="md"
                        onClick={() => {
                          setPropertyConfirmed(true)
                          track('property_confirmed')
                        }}
                      >
                        Yes, continue
                      </Button>
                      <Button type="button" variant="secondary" size="md" onClick={resetAddress}>
                        This isn&apos;t my property
                      </Button>
                    </div>
                  </div>
                )}
                {propertyConfirmed && (
                  <PropertyPhoto latitude={propertyLatLng?.lat} longitude={propertyLatLng?.lng} />
                )}
              </div>
            ) : (
              <>
                <div ref={addressContainerRef} aria-labelledby={addressLabelId} className={placesLib ? '' : 'hidden'} />
                {!placesLib && (
                  <Input
                    aria-labelledby={addressLabelId}
                    type="text"
                    value={situsAddress}
                    onChange={(e) => setSitusAddress(e.target.value)}
                    onBlur={() => situsAddress.trim() && setAddressConfirmed(true)}
                    placeholder="Start typing your address…"
                    autoComplete="off"
                  />
                )}
              </>
            )}
            {!parsedAddress && (
              <p className="mt-1.5 text-xs text-foreground-muted">
                {addressConfirmed
                  ? 'Fill in county and state below if they weren’t detected automatically.'
                  : 'Enter your county and state below if suggestions don’t appear.'}
              </p>
            )}
          </div>

          {propertyConfirmed && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="County (optional)">
                  <Input type="text" value={county} onChange={(e) => setCounty(e.target.value)} />
                </Field>
                <Field label="State (optional)">
                  <Input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="CA"
                  />
                </Field>
              </div>

              <Field label="APN (optional)">
                <Input type="text" value={apn} onChange={(e) => setApn(e.target.value)} />
              </Field>

              <Field label="Assessed value" required>
                <MoneyInput
                  value={assessedValue}
                  onChange={(v) => {
                    setAssessedValue(v)
                    setAssessorLookupApplied(false)
                  }}
                />
                {assessorLookupLoading && (
                  <p role="status" className="mt-1.5 text-xs text-foreground-muted">
                    Looking up your county&apos;s assessed value…
                  </p>
                )}
                {assessorLookupApplied && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-accent-green">
                    <CheckCircleIcon />
                    Auto-filled from county assessment records — edit if it looks off.
                  </p>
                )}
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Your own property&apos;s assessed value, from your most recent tax bill or
                  assessment notice.{' '}
                  {assessorLookupUrl && (
                    <a
                      href={assessorLookupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Look it up on the {county} County Assessor&apos;s site
                    </a>
                  )}
                </p>
              </Field>

              <Field label="Owner name (optional)">
                <Input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </Field>

              <Field label="Owner email (optional)">
                <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </Field>

              <Field label="Owner phone (optional)">
                <Input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
              </Field>

              <Field label="Do you live in this property? (optional)">
                <select
                  value={occupied}
                  onChange={(e) => setOccupied(e.target.value as 'yes' | 'no')}
                  className="h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>

              <Field label="Property type (optional)">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary-tint"
                >
                  <option value="">Select…</option>
                  <option value="single_family">Single family home</option>
                  <option value="condo">Condo / townhome</option>
                  <option value="multi_family">Multi-family (2-4 units)</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Used to fill in the correct property-type box on your official application.
                </p>
              </Field>

              <p className="text-xs text-foreground-muted">
                <span className="text-error">*</span> Required. Owner details are optional here —
                you&apos;ll only need to fill them in right before you pay for your appeal package.
              </p>

              {error && (
                <p role="alert" className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting…' : 'See My Recommendation'}
              </Button>
            </>
          )}
        </form>
      </Card>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0 text-accent-green">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
