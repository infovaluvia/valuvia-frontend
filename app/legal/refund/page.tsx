import LegalPageShell from '@/components/legal/LegalPageShell'

export const metadata = {
  title: 'Refund Policy — Valuvia',
  robots: { index: false, follow: false },
}

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Guarantee Policy">
      <p>
        Valuvia&apos;s $79 fee pays for the review and preparation of your appeal support package —
        it is separate from your county&apos;s filing fee, which you pay directly to the county
        and which is not refundable by Valuvia.
      </p>

      <p>
        <b>The guarantee:</b> if you file your appeal using a Valuvia package and the county does
        not reduce your assessed value by any amount — whether by a formal board decision or an
        informal reduction agreed with the assessor before a hearing — Valuvia refunds the $79
        fee in full.
      </p>

      <h2 className="text-base font-semibold text-foreground">What qualifies</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Valuvia&apos;s review recommended filing this case (see your order for this recommendation) — the guarantee doesn&apos;t cover cases we flagged for manual review or advised against filing.</li>
        <li>You actually filed the appeal using the package and reported that filing on your order.</li>
        <li>The county&apos;s outcome was &quot;assessment unchanged&quot; or &quot;appeal denied/dismissed&quot; — not a withdrawal on your part.</li>
        <li>You report the outcome within 60 days of receiving the county&apos;s decision, with documentation (the county&apos;s decision notice, or a screenshot of the county portal showing the outcome).</li>
        <li>The claim is made within 18 months of your purchase date.</li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">What this guarantee is not</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>It is not a guarantee that your assessment will be reduced, or by how much — see the <a href="/legal/disclaimer" className="text-primary hover:underline">Service Disclaimer</a>. It is a guarantee that if it isn&apos;t reduced, you get the $79 back.</li>
        <li>It does not cover the county&apos;s filing fee, or any other cost you incur (time, other fees, lost tax savings) — refunding Valuvia&apos;s fee is the sole remedy.</li>
        <li>It does not apply if you never file, if you withdraw the appeal before a decision, or if Valuvia&apos;s review recommended against filing and you filed anyway.</li>
        <li>Providing inaccurate intake information, or otherwise misrepresenting your property or eligibility, voids the guarantee.</li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">How it works</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Report your outcome from your order page once you hear back from the county, with proof of the decision.</li>
        <li>We review each claim by hand against the documentation provided — this can&apos;t be safely automated, since only you have the county&apos;s decision. Expect a response within 5 business days.</li>
        <li>Approved refunds go back to your original payment method and typically take 5-10 business days to appear on your statement.</li>
        <li>If a claim is denied, we&apos;ll explain why — reply to that email with any additional documentation if you believe it was a mistake.</li>
      </ul>

      <p>
        [Legal entity name, business address, and support contact — to be added once verified.]
      </p>
    </LegalPageShell>
  )
}
