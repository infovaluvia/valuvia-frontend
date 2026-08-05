import ContentPageShell from '@/components/content/ContentPageShell'

export const metadata = {
  title: 'Methodology — Valuvia',
  description: 'How Valuvia reviews a property assessment and where its data comes from.',
}

export default function MethodologyPage() {
  return (
    <ContentPageShell title="Methodology">
      <p>
        This page explains, in plain terms, where the information in your review comes from and
        how Valuvia arrives at a preliminary recommendation.
      </p>

      <h2 className="text-lg font-semibold text-foreground">Data sources</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Your county&apos;s own assessment records for the property being reviewed.</li>
        <li>
          Recent comparable property sales, sourced from RentCast and cross-checked against
          property records before being treated as a confirmed sale.
        </li>
        <li>Information you provide directly, such as your assessed value, property type, and any condition notes or photos.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground">How a recommendation is produced</h2>
      <p>
        Valuvia compares your property&apos;s assessed value against the market value indicated by
        qualifying comparable sales. A recommendation is produced only when there is enough
        verified comparable-sales evidence to support it; when evidence is thin, contradictory, or
        unavailable, the case is routed to manual review or a &quot;not currently recommended&quot;
        result rather than a guess.
      </p>
      <p>
        Value figures are shown as ranges where the underlying data supports a range, not as a
        single precise number — the evidence rarely supports that level of precision, and we would
        rather show you what we actually know than a falsely exact figure.
      </p>

      <h2 className="text-lg font-semibold text-foreground">Human review</h2>
      <p>
        Every paid appeal package is reviewed by a person before it&apos;s delivered — this isn&apos;t an
        automated-only process. The review checks the comparable sales, the calculations, and the
        completed application against your case before anything is sent to you.
      </p>

      <h2 className="text-lg font-semibold text-foreground">What this isn&apos;t</h2>
      <p>
        A Valuvia review is not a licensed appraisal, and it is not legal or tax advice. It is a
        preliminary, evidence-based review intended to help you decide whether an appeal may be
        worth pursuing.
      </p>
    </ContentPageShell>
  )
}
