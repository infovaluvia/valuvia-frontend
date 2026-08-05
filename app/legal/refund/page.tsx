import LegalPageShell from '@/components/legal/LegalPageShell'

export const metadata = {
  title: 'Refund Policy — Valuvia',
  robots: { index: false, follow: false },
}

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <p>
        Valuvia&apos;s fee pays for the review and preparation of your appeal support package —
        it is separate from any Santa Clara County filing fee, which is paid directly to the
        County and is not refundable by Valuvia.
      </p>
      <p>The final Refund Policy will cover, at minimum:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>What qualifies for a refund of Valuvia&apos;s service fee (e.g. an error in the package attributable to Valuvia) and what does not (e.g. the County declining to reduce the assessment)</li>
        <li>The window in which a refund request can be made</li>
        <li>How to request a refund and expected response time</li>
        <li>What happens to the case record and any generated documents after a refund</li>
        <li>That Valuvia does not guarantee an assessment reduction, and a refund is not available solely because an appeal was unsuccessful</li>
      </ul>
      <p>
        [Legal entity name, business address, and support contact — to be added once verified.]
      </p>
    </LegalPageShell>
  )
}
