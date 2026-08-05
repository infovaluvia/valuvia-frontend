import ContentPageShell from '@/components/content/ContentPageShell'

export const metadata = {
  title: 'About — Valuvia',
  description: 'What Valuvia is and who it serves.',
}

export default function AboutPage() {
  return (
    <ContentPageShell
      title="About Valuvia"
      pendingNotice="A verified founder/team bio has not been added yet, so none appears here — we don't publish invented names or credentials."
    >
      <p>
        Valuvia is an independent property assessment review service for Santa Clara County, CA
        homeowners. We review your county&apos;s assessment records against recent comparable sales,
        and where the evidence supports it, prepare the paperwork you need to file your own
        property tax appeal.
      </p>
      <p>
        Valuvia is not a government agency, is not affiliated with Santa Clara County or any
        county assessor&apos;s office, and does not provide legal or tax advice. You review, sign, and
        file your own appeal — Valuvia doesn&apos;t file, sign, or represent you before the county.
      </p>
    </ContentPageShell>
  )
}
