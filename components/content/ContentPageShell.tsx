import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'

// Shared shell for informational pages (About, Contact, Methodology,
// Accessibility) that the UI Redesign Master Plan requires the footer
// to link to. `pendingNotice` is only set for pages whose content
// depends on a fact we don't have yet (e.g. a founder name, a monitored
// contact address) -- per the plan's own rule, that's a visible content
// dependency, not invented copy.
export default function ContentPageShell({
  title,
  pendingNotice,
  children,
}: {
  title: string
  pendingNotice?: string
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>

          {pendingNotice && (
            <Card className="mt-6 border-warning/40 bg-warning-tint p-5">
              <p className="text-sm font-semibold text-warning">Content pending</p>
              <p className="mt-1.5 text-sm text-warning">{pendingNotice}</p>
            </Card>
          )}

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
