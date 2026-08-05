import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'

// Every legal page routes through this shell. It exists specifically so
// the "pending review" banner and structure can't drift out of sync
// across terms/privacy/disclaimer/refund -- when real, attorney-approved
// copy replaces a page's <LegalPageContent>, remove that page's banner
// only after counsel has actually signed off (see TASK-LEGAL-003).
export default function LegalPageShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>

          <Card className="mt-6 border-warning/40 bg-warning-tint p-5">
            <p className="text-sm font-semibold text-warning">
              Pending legal review — not yet in effect
            </p>
            <p className="mt-1.5 text-sm text-warning">
              This page describes what this document will cover. It has not been reviewed or
              approved by qualified counsel and is not Valuvia&apos;s final, binding{' '}
              {title.toLowerCase()}. Do not rely on it as complete or final. It will be replaced
              with reviewed, effective-dated language before Valuvia takes payment from customers
              in production.
            </p>
          </Card>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
