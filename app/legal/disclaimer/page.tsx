import LegalPageShell from '@/components/legal/LegalPageShell'

export const metadata = {
  title: 'Service Disclaimer — Valuvia',
  robots: { index: false, follow: false },
}

export default function DisclaimerPage() {
  return (
    <LegalPageShell title="Service Disclaimer">
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Valuvia is not a government agency and is not affiliated with Santa Clara County or any county assessor&apos;s office.</li>
        <li>Valuvia does not provide legal advice or tax advice.</li>
        <li>Valuvia&apos;s output is not a licensed appraisal unless that status is later legally established and disclosed.</li>
        <li>Valuvia does not file, sign, submit, negotiate, or represent customers before the County or any assessment appeals board. The property owner reviews, signs, and files their own appeal, and remains responsible for meeting deadlines, paying required fees, and continuing to pay property taxes when due.</li>
        <li>Preliminary value indications, recommendations, and estimated differences are estimates based on available public records and customer-provided information, not guarantees. Public-record and user-provided data can be incomplete or inaccurate.</li>
        <li>An assessment appeal or review can result in a reduction, no change, or (in rare cases under some rules) other outcomes; Valuvia does not guarantee any specific result. Separately, Valuvia&apos;s <a href="/legal/refund" className="text-primary hover:underline">Refund Guarantee</a> refunds Valuvia&apos;s own fee (not any outcome) if a qualifying appeal doesn&apos;t reduce the assessment — that is a refund guarantee, not a results guarantee.</li>
      </ul>
      <p>
        This page will be reviewed and finalized by qualified California counsel before Valuvia
        takes payment from customers in production; the points above describe the intended scope
        and are not yet final, counsel-approved language.
      </p>
    </LegalPageShell>
  )
}
