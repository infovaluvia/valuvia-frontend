'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

// Combined intake form: creates a property, then creates an order for it.
// Santa Clara only for the initial launch, so jurisdiction_code is fixed
// rather than exposed as a field.
const JURISDICTION_CODE = 'santa-clara'

export default function IntakeForm() {
  const router = useRouter()

  const [situsAddress, setSitusAddress] = useState('')
  const [apn, setApn] = useState('')
  const [assessedValue, setAssessedValue] = useState('') // dollars, converted to cents on submit
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [occupied, setOccupied] = useState<'yes' | 'no'>('yes')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const assessedCents = Math.round(parseFloat(assessedValue) * 100)
    if (!assessedCents || assessedCents <= 0) {
      setError('Please enter a valid assessed value.')
      return
    }

    setLoading(true)
    try {
      // Step 1: create the property
      const property = await apiFetch('/api/v1/properties', {
        method: 'POST',
        body: JSON.stringify({
          situs_address: situsAddress,
          apn: apn || undefined,
          jurisdiction_code: JURISDICTION_CODE,
        }),
      })

      // Step 2: create the order for that property
      const { order } = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          property_id: property.id,
          apn: apn || undefined,
          assessed_value_cents: assessedCents,
          owner_name: ownerName,
          owner_email: ownerEmail,
          owner_phone: ownerPhone || undefined,
          occupied,
          filing_status: 'owner',
        }),
      })

      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2>Property Tax Appeal — Santa Clara County</h2>

      <Field label="Property address">
        <input
          type="text"
          value={situsAddress}
          onChange={(e) => setSitusAddress(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="APN (optional)">
        <input
          type="text"
          value={apn}
          onChange={(e) => setApn(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Assessed value ($)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={assessedValue}
          onChange={(e) => setAssessedValue(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="Owner name">
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="Owner email">
        <input
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="Owner phone (optional)">
        <input
          type="tel"
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Do you live in this property?">
        <select
          value={occupied}
          onChange={(e) => setOccupied(e.target.value as 'yes' | 'no')}
          style={inputStyle}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, marginTop: 8 }}>
        {loading ? 'Submitting...' : 'Get My Estimate'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', padding: 8 }
