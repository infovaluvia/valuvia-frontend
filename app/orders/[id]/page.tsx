import { apiFetchServer } from '@/lib/api-server'
import CheckoutSection from '@/components/orders/CheckoutSection'

function formatDollars(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

interface Comp {
  address: string
  sale_date: string
  price: number
  sqft: number
  price_per_sqft: number
}

interface OrderData {
  order: {
    id: string
    status: string
    assessed_value_cents: number
    requested_value_cents: number
    estimated_savings_cents: number
  }
  comps: {
    source: string
    comps: Comp[]
    market_value_cents: number
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = (await apiFetchServer(`/api/v1/orders/${id}`)) as OrderData
  const { order, comps } = data

  return (
    <main style={{ padding: 40, maxWidth: 700, margin: '0 auto' }}>
      <h1>Your Estimate</h1>

      {/* comps.source is "demo" until a real data source is wired up —
          keep this notice visible until that happens. */}
      {comps.source === 'demo' && (
        <p style={{ background: '#fff8e1', padding: 12, borderRadius: 4, fontSize: 14 }}>
          These figures are an estimate based on sample data and are for reference only.
          Final values may differ.
        </p>
      )}

      <div style={{ display: 'flex', gap: 24, margin: '24px 0' }}>
        <Stat label="Assessed value" value={formatDollars(order.assessed_value_cents)} />
        <Stat label="Estimated market value" value={formatDollars(order.requested_value_cents)} />
        <Stat
          label="Estimated savings"
          value={formatDollars(order.estimated_savings_cents)}
          highlight
        />
      </div>

      <h2>Comparable Properties</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Sale Date</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Sqft</th>
            <th style={thStyle}>$/Sqft</th>
          </tr>
        </thead>
        <tbody>
          {comps.comps.map((c, i) => (
            <tr key={i}>
              <td style={tdStyle}>{c.address}</td>
              <td style={tdStyle}>{c.sale_date}</td>
              <td style={tdStyle}>{formatDollars(c.price * 100)}</td>
              <td style={tdStyle}>{c.sqft}</td>
              <td style={tdStyle}>${c.price_per_sqft}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <CheckoutSection orderId={order.id} initialStatus={order.status} />
    </main>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: highlight ? '#2e7d32' : undefined }}>
        {value}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '8px 4px',
  fontSize: 13,
}
const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '8px 4px',
  fontSize: 14,
}
