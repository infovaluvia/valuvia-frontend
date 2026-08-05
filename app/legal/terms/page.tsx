import LegalPageShell from '@/components/legal/LegalPageShell'

export const metadata = {
  title: 'Terms of Service — Valuvia',
  robots: { index: false, follow: false },
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <p>
        Valuvia provides independent, owner-directed property assessment review and decision
        support for eligible Santa Clara County, CA homeowners. Valuvia is not a government
        agency, is not affiliated with Santa Clara County or any county assessor&apos;s office,
        does not provide legal or tax advice, and does not file, sign, submit, or represent
        customers before any government body — the property owner reviews, signs, and files their
        own appeal.
      </p>
      <p>The final Terms of Service will cover, at minimum:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>What the service does and does not include, and its Santa Clara County-only scope</li>
        <li>Account creation, eligibility, and acceptable use</li>
        <li>Pricing, payment, and the separation between Valuvia&apos;s fee and any county filing fee</li>
        <li>Ownership of generated reports and use restrictions</li>
        <li>Disclaimers of guaranteed outcomes and limitation of liability</li>
        <li>Dispute resolution and governing law</li>
        <li>How these terms may change, and how customers are notified</li>
      </ul>
      <p>
        [Legal entity name, business address, and support contact — to be added once verified.]
      </p>
    </LegalPageShell>
  )
}
