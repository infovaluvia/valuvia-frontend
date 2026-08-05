import ContentPageShell from '@/components/content/ContentPageShell'

export const metadata = {
  title: 'Contact — Valuvia',
  description: 'How to reach Valuvia with a question about your order or account.',
  robots: { index: false, follow: false },
}

export default function ContactPage() {
  return (
    <ContentPageShell
      title="Contact"
      pendingNotice="A monitored support email/phone number has not been confirmed yet, so it isn't published here. Once one is set up, this page will show it directly."
    >
      <p>
        If you have a question about an existing order, the fastest path is the assistant in the
        bottom-right corner of any page, or your order&apos;s dashboard, which shows the current
        status of your case.
      </p>
      <p>
        For anything else, check back here shortly — we&apos;re finishing setup of a monitored
        support contact.
      </p>
    </ContentPageShell>
  )
}
