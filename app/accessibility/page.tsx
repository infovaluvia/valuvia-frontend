import ContentPageShell from '@/components/content/ContentPageShell'

export const metadata = {
  title: 'Accessibility — Valuvia',
  description: 'Valuvia’s accessibility commitment and how to report an issue.',
}

export default function AccessibilityPage() {
  return (
    <ContentPageShell
      title="Accessibility"
      pendingNotice="This page states our intended accessibility commitment. A dedicated, monitored contact address for accessibility issues has not been set up yet — until it is, please use the general contact page."
    >
      <p>
        Valuvia is built to target the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA.
        That means aiming for things like: every page usable by keyboard alone, visible focus
        indicators, text and controls that meet minimum contrast requirements, form fields with
        real labels, and content that works with screen readers.
      </p>
      <p>
        This is an ongoing commitment, not a claim of full or certified compliance. If you run
        into something on the site that doesn&apos;t work well with the technology you use, we want
        to know about it.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Reporting an issue</h2>
      <p>
        Please describe the page you were on, what you were trying to do, and what happened,
        through our <a href="/contact" className="font-medium text-primary hover:underline">contact page</a>.
      </p>
    </ContentPageShell>
  )
}
