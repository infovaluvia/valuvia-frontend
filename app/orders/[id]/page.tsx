import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ checkout?: string }>
}) {
  const { id } = await params
  const { checkout } = await searchParams
  const data = (await apiFetchServer(`/api/v1/orders/${id}`)) as OrderData
  const { order, comps } = data

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface-alt py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
            Step 2 of 2 — Your estimate
          </p>
          <h1 className="mt-2 text-center text-2xl font-bold text-foreground md:text-3xl">
            Your Estimate
          </h1>

          {comps.source === 'demo' && (
            <p className="mt-6 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
              These figures are an estimate based on sample data and are for
              reference only. Final values may differ.
            </p>
          )}

          <Card className="mt-6 p-6 md:p-8">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Assessed value" value={formatDollars(order.assessed_value_cents)} />
              <Stat
                label="Estimated market value"
                value={formatDollars(order.requested_value_cents)}
              />
              <Stat
                label="Estimated savings"
                value={formatDollars(order.estimated_savings_cents)}
                highlight
              />
            </div>
          </Card>

          <h2 className="mt-10 text-lg font-semibold text-foreground">
            Comparable Properties
          </h2>
          <Card className="mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <Th>Address</Th>
                  <Th>Sale Date</Th>
                  <Th>Price</Th>
                  <Th>Sqft</Th>
                  <Th>$/Sqft</Th>
                </tr>
              </thead>
              <tbody>
                {comps.comps.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <Td>{c.address}</Td>
                    <Td>{c.sale_date}</Td>
                    <Td>{formatDollars(c.price * 100)}</Td>
                    <Td>{c.sqft}</Td>
                    <Td>${c.price_per_sqft}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <CheckoutSection orderId={order.id} initialStatus={order.status} checkoutResult={checkout} />
        </div>
      </main>
      <Footer />
    </>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-foreground-muted">{label}</div>
      <div
        className={`mt-1 text-xl font-bold ${highlight ? 'text-accent-green' : 'text-foreground'}`}
      >
        {value}
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground-muted">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-foreground">{children}</td>
}
