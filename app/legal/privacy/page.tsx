import LegalPageShell from '@/components/legal/LegalPageShell'

export const metadata = {
  title: 'Privacy Policy — Valuvia',
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        To review your property, Valuvia collects information you provide (such as your property
        address, assessed value, contact details, and any documents you upload) and uses it to
        prepare your preliminary review and, if you purchase one, your appeal support package.
      </p>
      <p>The final Privacy Policy will cover, at minimum:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>What personal and property information is collected, and why</li>
        <li>Which third-party vendors process data on Valuvia&apos;s behalf (e.g. payment processing, email delivery, hosting, analytics) and what each receives</li>
        <li>How long data is retained and how a customer can request deletion</li>
        <li>Cookie and analytics usage, and available opt-outs</li>
        <li>How documents and photos are secured and who can access them</li>
        <li>Applicable state privacy rights (e.g. California) and how to exercise them</li>
        <li>How to contact Valuvia with a privacy question or request</li>
      </ul>
      <p>
        [Legal entity name, business address, and support contact — to be added once verified.]
      </p>
    </LegalPageShell>
  )
}
