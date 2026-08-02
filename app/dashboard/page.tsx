import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { apiFetchServer } from '@/lib/api-server'

interface OrderSummary {
  id: string
  status: string
  assessed_value_cents: number
  requested_value_cents: number
  estimated_savings_cents: number
  created_at: string
  properties: { situs_address: string } | null
}

function formatDollars(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

const STATUS_LABEL: Record<string, string> = {
  intake: 'Intake',
  comps_review: 'Awaiting payment',
  paid: 'Preparing documents',
  documents_generated: 'Ready to file',
  filed: 'Filed',
  hearing_scheduled: 'Hearing scheduled',
  resolved: 'Resolved',
  refunded: 'Refunded',
}

const STATUS_TONE: Record<string, 'neutral' | 'info' | 'success' | 'warning'> = {
  intake: 'neutral',
  comps_review: 'warning',
  paid: 'info',
  documents_generated: 'success',
  filed: 'success',
  hearing_scheduled: 'info',
  resolved: 'success',
  refunded: 'neutral',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // In theory `user` should never be null (proxy.ts auto-creates an
  // anonymous session), but keep this fallback in case proxy didn't run
  // or errored, so the page doesn't crash.
  if (!user) {
    redirect('/login')
  }

  let orders: OrderSummary[] = []
  let loadError = false
  try {
    orders = (await apiFetchServer('/api/v1/orders')) as OrderSummary[]
  } catch {
    loadError = true
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface-alt py-10 md:py-14">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user.is_anonymous ? 'Your Appeals' : `Welcome back, ${user.email}`}
              </h1>
              {user.is_anonymous && (
                <p className="mt-1 text-sm text-foreground-muted">
                  You&apos;re browsing without an account.{' '}
                  <Link href="/account/save" className="font-medium text-primary hover:underline">
                    Save your account
                  </Link>{' '}
                  to access your files later from any device.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button href="/appeal/new" size="md">
                Start New Appeal
              </Button>
              <Link
                href="/account"
                className="h-11 rounded-[var(--radius-sm)] border border-border px-5 text-sm font-semibold leading-[2.75rem] text-foreground-muted transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Account Settings
              </Link>
              <SignOutButton />
            </div>
          </div>

          {loadError && (
            <Card className="mt-8 border-error/30 bg-error-tint p-5 text-sm text-error">
              Couldn&apos;t load your appeals right now. Please refresh the page.
            </Card>
          )}

          {!loadError && orders.length === 0 && (
            <Card className="mt-8 flex flex-col items-center gap-3 p-12 text-center">
              <p className="text-foreground-muted">
                You don&apos;t have any appeals yet.
              </p>
              <Button href="/appeal/new">Check My Property</Button>
            </Card>
          )}

          {orders.length > 0 && (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:border-primary/40 md:p-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.properties?.situs_address ?? 'Property'}
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Filed {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-6">
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-foreground-muted">Est. savings</p>
                        <p className="text-base font-bold text-accent-green">
                          {formatDollars(order.estimated_savings_cents)}
                        </p>
                      </div>
                      <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="h-11 rounded-[var(--radius-sm)] border border-border px-5 text-sm font-semibold text-foreground-muted transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        Log Out
      </button>
    </form>
  )
}
