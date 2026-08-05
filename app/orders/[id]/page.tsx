import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { apiFetchServer } from '@/lib/api-server'
import CheckoutSection from '@/components/orders/CheckoutSection'
import CompleteDetailsForm from '@/components/orders/CompleteDetailsForm'
import ApplicationPreview from '@/components/orders/ApplicationPreview'
import ConditionIntakeForm from '@/components/orders/ConditionIntakeForm'

function formatDollars(cents: number | null | undefined) {
  if (cents == null) return 'Data unavailable'
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface Comp {
  address: string
  sale_date: string
  price: number
  sqft: number
  price_per_sqft: number
}

interface Jurisdiction {
  name: string
  filing_window_start: string | null
  filing_window_end: string | null
  filing_fee_cents: number
  mailing_address: string | null
  online_filing_url: string | null
  appeal_board_name: string | null
}

interface Screening {
  verdict: 'not_supported' | 'out_of_window' | 'possible_candidate' | 'flagged_overassessed'
  reasons: string[]
  filing_deadline: string | null
  disclaimer: string | null
}

interface Recommendation {
  recommendation: 'appeal_recommended' | 'manual_review_required' | 'not_recommended'
  reason_codes: string[]
  evidence_strength: string
}

interface OrderData {
  order: {
    id: string
    status: string
    assessed_value_cents: number | null
    requested_value_cents: number
    estimated_savings_cents: number
    recommendation_json: Recommendation | null
  }
  comps: {
    source: string
    comps: Comp[]
    market_value_cents: number
  }
  jurisdiction: Jurisdiction | null
  screening: Screening | null
  missing_fields: string[]
}

const VERDICT_COPY: Record<Screening['verdict'], { title: string; tone: 'success' | 'warning' | 'error' | 'info' }> = {
  possible_candidate: { title: 'Worth pursuing', tone: 'info' },
  flagged_overassessed: { title: 'Strong candidate', tone: 'success' },
  out_of_window: { title: 'Filing window issue', tone: 'warning' },
  not_supported: { title: 'Not supported yet', tone: 'error' },
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
  const { order, comps, jurisdiction, screening, missing_fields } = data

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
            Step 2 of 3 — Your recommendation
          </p>
          <h1 className="mt-2 text-center text-2xl font-bold text-foreground md:text-3xl">
            Your Recommendation
          </h1>

          {!screening ? (
            <>
              <Card className="mt-6 p-6 text-center text-sm text-foreground-muted md:p-8">
                Add your assessed value below to see whether your property is worth appealing.
              </Card>
              <CompleteDetailsForm
                orderId={order.id}
                missingFields={missing_fields}
                title="Tell us your assessed value"
              />
            </>
          ) : (
            <>
              <RecommendationCard screening={screening} />

              {jurisdiction && <ProcessCard jurisdiction={jurisdiction} formatDollars={formatDollars} />}

              <Card className="mt-6 p-6 md:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

              {comps.source !== 'unsupported' && (
                <CompsSection comps={comps} formatDollars={formatDollars} />
              )}

              {screening.verdict === 'not_supported' ? (
                <Card className="mt-8 p-6 text-center text-sm text-foreground-muted md:p-8">
                  We&apos;ll email you as soon as we support appeals in your county.
                </Card>
              ) : order.recommendation_json?.recommendation === 'not_recommended' ? (
                <Card className="mt-8 p-6 text-center text-sm text-foreground-muted md:p-8">
                  Based on available market evidence, an appeal doesn&apos;t currently appear
                  economically reasonable for this property, so we&apos;re not able to sell the
                  appeal package for it. If your assessed value or comparable sales change, come
                  back and we&apos;ll re-check.
                </Card>
              ) : (
                <>
                  {order.recommendation_json?.recommendation === 'manual_review_required' && (
                    <p className="mt-6 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
                      This case needs a closer look before we can confirm an appeal is worth
                      pursuing — you can still purchase the package, and our team will review your
                      evidence before delivering it.
                    </p>
                  )}
                  {(order.status === 'intake' || order.status === 'comps_review') && (
                    <>
                      <ApplicationPreview orderId={order.id} />
                      <ConditionIntakeForm orderId={order.id} recommendedValueCents={comps.market_value_cents} />
                    </>
                  )}
                  <PackagePreviewCard />
                  <CheckoutSection
                    orderId={order.id}
                    initialStatus={order.status}
                    checkoutResult={checkout}
                    missingFields={missing_fields}
                    recommendedValueCents={comps.market_value_cents}
                    filingFeeCents={jurisdiction?.filing_fee_cents}
                    countyName={jurisdiction?.name}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function RecommendationCard({ screening }: { screening: Screening }) {
  const verdictCopy = VERDICT_COPY[screening.verdict]
  return (
    <Card className="mt-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Badge tone={verdictCopy.tone}>{verdictCopy.title}</Badge>
      </div>
      <ul className="mt-4 space-y-2">
        {screening.reasons.map((reason, i) => (
          <li key={i} className="text-sm text-foreground">
            {reason}
          </li>
        ))}
      </ul>
      {screening.disclaimer && (
        <p className="mt-4 text-xs text-foreground-muted">{screening.disclaimer}</p>
      )}
    </Card>
  )
}

function ProcessCard({
  jurisdiction,
  formatDollars,
}: {
  jurisdiction: Jurisdiction
  formatDollars: (cents: number | null | undefined) => string
}) {
  return (
    <>
      <h2 className="mt-10 text-lg font-semibold text-foreground">How the Appeal Process Works</h2>
      <Card className="mt-4 p-6 md:p-8">
        <ol className="space-y-3 text-sm text-foreground">
          <li>
            <b>1. Filing window:</b>{' '}
            {jurisdiction.filing_window_start && jurisdiction.filing_window_end
              ? `${jurisdiction.filing_window_start} to ${jurisdiction.filing_window_end}`
              : 'Data unavailable'}{' '}
            with {jurisdiction.name}.
          </li>
          <li>
            <b>2. Filing fee:</b> {formatDollars(jurisdiction.filing_fee_cents)}, paid when you
            submit the official application.
          </li>
          <li>
            <b>3. Submit:</b> Print, sign, and mail your completed package to{' '}
            {jurisdiction.mailing_address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jurisdiction.mailing_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {jurisdiction.mailing_address}
              </a>
            ) : (
              'the address in your filing package'
            )}
            {jurisdiction.online_filing_url && (
              <>
                , or{' '}
                <a
                  href={jurisdiction.online_filing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  file online
                </a>
              </>
            )}
            .
          </li>
          <li>
            <b>4. Hearing:</b> The {jurisdiction.appeal_board_name || 'Assessment Appeals Board'} reviews your evidence and issues a
            decision — your Hearing Binder walks through what to expect.
          </li>
        </ol>
      </Card>
    </>
  )
}

const PACKAGE_VOLUMES = [
  'Official county appeal application, pre-filled and ready to sign',
  'Executive Summary — the case for your appeal in one page',
  'Government Filing Package — completion worksheet and submission checklist',
  'Comparable Sales Report',
  'Property Condition Report',
  'Evidence Book — full assessment history and adjustment framework',
  'Hearing Binder — opening statement and anticipated Board questions',
]

function PackagePreviewCard() {
  return (
    <>
      <h2 className="mt-10 text-lg font-semibold text-foreground">
        What You&apos;ll Get &amp; How to Use It
      </h2>
      <Card className="mt-4 p-6 md:p-8">
        <p className="text-sm text-foreground">
          Your package includes 7 documents, generated specifically for your property:
        </p>
        <ul className="mt-3 space-y-1.5">
          {PACKAGE_VOLUMES.map((v) => (
            <li key={v} className="flex gap-2 text-sm text-foreground">
              <span className="text-accent-green">✓</span>
              {v}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm text-foreground">
          <b>To appeal:</b> print and sign the official application, mail it (or file online
          where available) with the filing fee by the deadline above, then bring the Evidence
          Book, Comparable Sales Report, and Hearing Binder to your hearing.
        </p>

        <p className="mt-5 rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
          <b>Our commitment:</b> if anything in your package is inaccurate or incomplete because of
          an error on our end, contact support and we&apos;ll fix it or make it right. We can&apos;t
          guarantee the outcome of your county&apos;s independent review — no one honestly can — but
          we stand behind the accuracy of what we generate.
        </p>
      </Card>
    </>
  )
}

function CompsSection({
  comps,
  formatDollars,
}: {
  comps: OrderData['comps']
  formatDollars: (cents: number | null | undefined) => string
}) {
  return (
    <>
      <h2 className="mt-10 text-lg font-semibold text-foreground">Comparable Properties</h2>
      {comps.source === 'demo' ? (
        <p className="mt-2 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
          These are placeholder example figures, not based on your actual property — real
          comparable sales data isn&apos;t configured for this environment yet.
        </p>
      ) : (
        comps.source !== 'verified' && (
          <p className="mt-2 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
            These figures come from an automated market estimate and are not independently
            verified by an appraiser. Final values may differ.
          </p>
        )
      )}
      {comps.comps.length === 0 ? (
        <Card className="mt-4 p-6 text-center text-sm text-foreground-muted">
          No comparable sales were found for this property yet.
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
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
                    <Td>{formatDollars(c.price_per_sqft * 100)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
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
