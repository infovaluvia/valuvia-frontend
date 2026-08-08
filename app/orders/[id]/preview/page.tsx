import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiFetchServer } from '@/lib/api-server'
import PreviewPackageGallery from '@/components/orders/PreviewPackageGallery'

type PreviewOrderData = {
  order: {
    id: string
    estimated_savings_cents: number | null
    requested_value_cents: number | null
    intake_json?: { situs_address?: string | null } | null
  }
  comps: { comps: unknown[] }
}

// The order UUID in the URL is unavoidable (this page needs it to fetch
// the right order), but the tab title/page content shouldn't force a
// visitor to read a UUID to know what they're looking at -- set the tab
// title and heading from the property address instead.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const data = (await apiFetchServer(`/api/v1/orders/${id}`)) as PreviewOrderData
  const address = data.order.intake_json?.situs_address
  return {
    title: address ? `Preview for ${address} appeal package — Valuvia` : 'Appeal Package Preview — Valuvia',
  }
}

// Split out from the main order page (which was getting overloaded --
// a full recommendation breakdown, process explainer, comps table, AND
// a 6-7-volume image gallery all stacked on one screen) so the order
// page can stay focused on "should I buy this," and this page is where
// someone actually wants to linger over every page of every volume.
export default async function OrderPackagePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = (await apiFetchServer(`/api/v1/orders/${id}`)) as PreviewOrderData
  const { order, comps } = data
  const address = order.intake_json?.situs_address

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[900px] px-6">
          <Link
            href={`/orders/${id}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to your recommendation
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
            {address ? `Preview for ${address} appeal package` : 'Your Appeal Package Preview'}
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Every volume of your package, exactly as it will be generated — watermarked and, for
            the documents that make up the paid deliverable, not yet unlocked. Purchasing removes
            the watermark and unlocks the full, filing-ready copies.
          </p>

          <PreviewPackageGallery
            orderId={order.id}
            estimatedSavingsCents={order.estimated_savings_cents}
            requestedValueCents={order.requested_value_cents}
            comparableCount={comps.comps?.length ?? 0}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
