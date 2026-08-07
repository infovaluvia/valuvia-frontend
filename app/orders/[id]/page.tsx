import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { apiFetchServer } from '@/lib/api-server'
import CheckoutSection from '@/components/orders/CheckoutSection'
import CompleteDetailsForm from '@/components/orders/CompleteDetailsForm'
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

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface Comp {
  address: string
  sale_date: string
  price: number
  sqft: number
  price_per_sqft: number
  stale?: boolean
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

interface SavingsEstimate {
  first_year_savings_cents: number
  valuvia_fee_cents: number
  filing_fee_cents: number | null
  net_first_year_savings_cents: number
  projection_years: number
  per_year_savings_cents: number[]
  cumulative_projected_savings_cents: number
  projection_note: string
}

interface TimelineEstimate {
  filing_deadline: string | null
  statutory_decision_deadline: string | null
  statutory_decision_note: string | null
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
    requested_value_cents: number | null
    estimated_savings_cents: number | null
    recommendation_json: Recommendation | null
    appeal_outcome: 'reduced' | 'unchanged' | 'denied' | 'withdrawn' | null
  }
  comps: {
    source: string
    comps: Comp[]
    market_value_cents: number
    assessment_year?: number
    lien_date?: string
  }
  jurisdiction: Jurisdiction | null
  screening: Screening | null
  missing_fields: string[]
  savings_estimate: SavingsEstimate | null
  timeline_estimate: TimelineEstimate | null
}

const VERDICT_COPY: Record<Screening['verdict'], { title: string; tone: 'success' | 'warning' | 'error' | 'info' }> = {
  // "possible_candidate" is the neutral default for any eligible
  // property -- screening.py never touches comps here, so there is no
  // actual evidence of overassessment behind it (verified live: a real
  // property with real comps showing it's UNDER-assessed still lands
  // here, since eligibility alone drives this verdict). "Worth
  // pursuing" claimed a conclusion this verdict doesn't back up;
  // "flagged_overassessed" below is the one verdict actually grounded
  // in a real year-over-year assessment signal.
  possible_candidate: { title: 'Eligible to check', tone: 'info' },
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
  const { order, comps, jurisdiction, screening, missing_fields, savings_estimate, timeline_estimate } = data
  // comps.market_value_cents is the raw comps-service output and can carry
  // a number even when there's no real evidence behind it (demo fallback,
  // or a RentCast AVM estimate with zero verified comps) -- the backend
  // already nulls order.requested_value_cents for exactly those cases, so
  // reuse that instead of re-deriving the same fail-closed rule here.
  const verifiedMarketValueCents = order.requested_value_cents ?? undefined

  // Kept as a boolean rather than inlined three times below -- it
  // gates both the checkout-time flow (preview link + condition intake)
  // and, further down, whether the package-preview link even makes
  // sense to show at all (an already-paid order has no more "preview
  // before you buy" step left).
  const inCheckoutFlow = order.status === 'intake' || order.status === 'comps_review'

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
            Step 2 of 3 — Your recommendation
          </p>
          <h1 className="mt-2 text-center text-3xl font-bold text-foreground md:text-4xl">
            Your Recommendation
          </h1>

          {!screening ? (
            <>
              <Card className="mt-6 p-6 text-center text-base text-foreground-muted md:p-8">
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

              {/* The three numbers that actually answer "is this worth it" --
                  kept as the very next thing after the verdict, ahead of any
                  supporting detail, since that's the order a reader actually
                  needs them in to decide whether to keep reading. */}
              <Card className="mt-6 p-6 md:p-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

              {screening.verdict === 'not_supported' ? (
                <Card className="mt-8 p-6 text-center text-base text-foreground-muted md:p-8">
                  We&apos;ll email you as soon as we support appeals in your county.
                </Card>
              ) : order.recommendation_json?.recommendation === 'not_recommended' ? (
                <Card className="mt-8 p-6 text-center text-base text-foreground-muted md:p-8">
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

                  {inCheckoutFlow && (
                    <Link
                      href={`/orders/${order.id}/preview`}
                      className="mt-6 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-primary/25 bg-primary-tint px-5 py-4 transition hover:border-primary/50"
                    >
                      <span>
                        <span className="block text-base font-semibold text-foreground">
                          See your full appeal package preview
                        </span>
                        <span className="mt-0.5 block text-sm text-foreground-muted">
                          Every page of every volume, watermarked — see exactly what you&apos;re buying
                        </span>
                      </span>
                      <ArrowRightIcon />
                    </Link>
                  )}

                  {inCheckoutFlow && (
                    <ConditionIntakeForm orderId={order.id} recommendedValueCents={verifiedMarketValueCents} />
                  )}

                  <CheckoutSection
                    orderId={order.id}
                    initialStatus={order.status}
                    checkoutResult={checkout}
                    missingFields={missing_fields}
                    recommendedValueCents={verifiedMarketValueCents}
                    filingFeeCents={jurisdiction?.filing_fee_cents}
                    countyName={jurisdiction?.name}
                    initialAppealOutcome={order.appeal_outcome}
                  />
                </>
              )}

              {/* Supporting detail -- real and important, but secondary to
                  the decision above, so it lives below the fold instead of
                  pushing checkout down past several screens of tables. */}
              <div className="mt-14 border-t border-border pt-10">
                <h2 className="text-base font-semibold text-foreground-muted">More detail</h2>

                {savings_estimate && <SavingsBreakdownCard estimate={savings_estimate} formatDollars={formatDollars} />}

                {comps.source !== 'unsupported' && (
                  <CompsSection comps={comps} formatDollars={formatDollars} />
                )}

                {jurisdiction && (
                  <ProcessCard jurisdiction={jurisdiction} formatDollars={formatDollars} timeline={timeline_estimate} />
                )}
              </div>
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
          <li key={i} className="text-base text-foreground">
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
  timeline,
}: {
  jurisdiction: Jurisdiction
  formatDollars: (cents: number | null | undefined) => string
  timeline?: TimelineEstimate | null
}) {
  return (
    <>
      <h3 className="mt-8 text-base font-semibold text-foreground">How the Appeal Process Works</h3>
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
          {timeline?.statutory_decision_note && (
            <li>
              <b>5. Legal decision deadline:</b> {timeline.statutory_decision_note}
              {timeline.statutory_decision_deadline && (
                <> For you, that&apos;s <b>{timeline.statutory_decision_deadline}</b> based on the filing date you reported.</>
              )}
            </li>
          )}
        </ol>
      </Card>
    </>
  )
}

function SavingsBreakdownCard({
  estimate,
  formatDollars,
}: {
  estimate: SavingsEstimate
  formatDollars: (cents: number | null | undefined) => string
}) {
  return (
    <Card className="mt-4 p-6 md:p-8">
      <h4 className="text-sm font-semibold text-foreground-muted">Savings Breakdown</h4>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat label="Valuvia's fee" value={formatDollars(estimate.valuvia_fee_cents)} />
        <Stat label="County filing fee" value={formatDollars(estimate.filing_fee_cents)} />
        <Stat label="Net first-year savings" value={formatDollars(estimate.net_first_year_savings_cents)} highlight />
        <Stat
          label={`${estimate.projection_years}-year projected savings`}
          value={formatDollars(estimate.cumulative_projected_savings_cents)}
        />
      </div>
      <p className="mt-4 text-xs text-foreground-muted">{estimate.projection_note}</p>
    </Card>
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
      <h3 className="mt-8 text-base font-semibold text-foreground">Comparable Properties</h3>
      {comps.source !== 'demo' && comps.source !== 'verified' && (
        <p className="mt-2 rounded-[var(--radius-sm)] bg-warning-tint px-4 py-3 text-sm text-warning">
          These figures come from an automated market estimate and are not independently
          verified by an appraiser. Final values may differ.
        </p>
      )}
      {comps.assessment_year && comps.lien_date && comps.source !== 'demo' && (
        <p className="mt-2 text-xs text-foreground-muted">
          A California decline-in-value appeal for the {comps.assessment_year} assessment roll is
          about fair market value as of the January 1, {comps.assessment_year} lien date — these
          figures reflect recent comparable sales and have not been separately adjusted to that
          date.
        </p>
      )}
      {comps.source === 'demo' ? (
        // Never render fabricated placeholder comps as if they were real
        // rows in a table -- even disclosed, that's still evidence that
        // doesn't exist appearing on a customer screen (Appeal Package
        // Redesign Plan P0.3: "Prevent prohibited comparables from
        // appearing in customer screens ... represented as real cases").
        <Card className="mt-4 p-6 text-center text-sm text-foreground-muted">
          Real comparable sales data isn&apos;t available for this property yet. Our team has been
          notified and will follow up.
        </Card>
      ) : comps.comps.length === 0 ? (
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
                    <Td>
                      {formatDate(c.sale_date)}
                      {c.stale && (
                        <span className="ml-1.5 rounded-full bg-warning-tint px-1.5 py-0.5 text-[0.7rem] font-medium text-warning">
                          older sale
                        </span>
                      )}
                    </Td>
                    <Td>{formatDollars(c.price * 100)}</Td>
                    <Td>{c.sqft}</Td>
                    <Td>{formatDollars(c.price_per_sqft * 100)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {comps.comps.some((c) => c.stale) && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-foreground-muted">
              Comps marked &quot;older sale&quot; are more than 24 months old — included because no
              more recent comparable sale was available nearby.
            </p>
          )}
        </Card>
      )}
    </>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-sm text-foreground-muted">{label}</div>
      <div
        className={`mt-1 text-2xl font-bold ${highlight ? 'text-accent-green' : 'text-foreground'}`}
      >
        {value}
      </div>
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 flex-shrink-0 text-primary">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
