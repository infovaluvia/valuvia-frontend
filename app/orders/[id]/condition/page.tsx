import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiFetchServer } from '@/lib/api-server'
import ConditionIntakeForm from '@/components/orders/ConditionIntakeForm'

// Split out from the main order page, same reasoning as the package
// preview page -- this is optional, take-your-time context gathering
// (opinion of value, condition notes, photos), not something that
// needs to sit between the recommendation and the buy button.
export default async function OrderConditionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = (await apiFetchServer(`/api/v1/orders/${id}`)) as {
    order: {
      id: string
      requested_value_cents: number | null
      intake_json: {
        owner_phone?: string | null
        mailing_street?: string | null
        mailing_city?: string | null
        mailing_state?: string | null
        mailing_zip?: string | null
        owner_alternate_phone?: string | null
        owner_fax?: string | null
      }
    }
  }
  const { order } = data

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6">
          <Link
            href={`/orders/${id}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to your recommendation
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
            Additional Info
          </h1>
          <p className="mt-2 text-base text-foreground-muted">
            Optional, but it strengthens your case: your own opinion of value, any condition
            issues an appraiser should know about, photos, and any contact details for your
            official application. You can also add or edit this after you purchase.
          </p>

          <ConditionIntakeForm
            orderId={order.id}
            recommendedValueCents={order.requested_value_cents ?? undefined}
            intake={order.intake_json}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
