import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { apiFetchServer } from "@/lib/api-server";

export const metadata = {
  title: "Admin — Valuvia",
  robots: { index: false, follow: false },
};

function formatDollars(cents: number | null | undefined) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Summary {
  orders_total: number;
  orders_by_status: Record<string, number>;
  revenue_cents: number;
  paid_order_count: number;
  leads_total: number;
  leads_redeemed: number;
  leads_redemption_rate: number | null;
}

interface AdminOrder {
  id: string;
  status: string;
  assessed_value_cents: number | null;
  requested_value_cents: number | null;
  estimated_savings_cents: number | null;
  opinion_of_value_cents: number | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  situs_address: string | null;
}

interface AdminEvent {
  kind: "audit" | "notification";
  label: string;
  entity_type: string;
  entity_id: string;
  at: string;
}

const STATUS_TONE: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  intake: "neutral",
  comps_review: "neutral",
  paid: "info",
  documents_generated: "success",
  filed: "success",
  hearing_scheduled: "info",
  resolved: "success",
  refunded: "warning",
};

export default async function AdminPage() {
  let summary: Summary | null = null;
  let orders: AdminOrder[] = [];
  let events: AdminEvent[] = [];
  let error: string | null = null;

  try {
    const [summaryRes, ordersRes, eventsRes] = await Promise.all([
      apiFetchServer("/api/v1/admin/summary"),
      apiFetchServer("/api/v1/admin/orders?limit=50"),
      apiFetchServer("/api/v1/admin/events?limit=50"),
    ]);
    summary = summaryRes;
    orders = ordersRes.orders;
    events = eventsRes.events;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load admin data";
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[1180px] px-6 md:px-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin</h1>

          {error ? (
            <Card className="mt-6 p-6 text-sm text-foreground-muted">
              {error.includes("403") ? (
                <>
                  You&apos;re signed in, but this account doesn&apos;t have admin access. Ask
                  someone with Supabase access to set your <code>profiles.role</code> to{" "}
                  <code>admin</code>.
                </>
              ) : (
                <>Couldn&apos;t load admin data: {error}</>
              )}
            </Card>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatTile label="Total orders" value={String(summary!.orders_total)} />
                <StatTile label="Paid orders" value={String(summary!.paid_order_count)} />
                <StatTile label="Revenue" value={formatDollars(summary!.revenue_cents)} highlight />
                <StatTile label="Leads redeemed" value={String(summary!.leads_redeemed)} />
                <StatTile
                  label="Redemption rate"
                  value={
                    summary!.leads_redemption_rate != null
                      ? `${Math.round(summary!.leads_redemption_rate * 100)}%`
                      : "—"
                  }
                />
              </div>

              <Card className="mt-4 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  Orders by status
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(summary!.orders_by_status).map(([status, count]) => (
                    <Badge key={status} tone={STATUS_TONE[status] ?? "neutral"}>
                      {status.replace(/_/g, " ")}: {count}
                    </Badge>
                  ))}
                </div>
              </Card>

              <h2 className="mt-10 text-lg font-semibold text-foreground">Recent orders</h2>
              <Card className="mt-4 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-alt">
                        <Th>Property</Th>
                        <Th>Owner</Th>
                        <Th>Status</Th>
                        <Th>Assessed</Th>
                        <Th>Market est.</Th>
                        <Th>Opinion of value</Th>
                        <Th>Created</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border last:border-0">
                          <Td>{o.situs_address ?? "—"}</Td>
                          <Td>
                            {o.owner_name ?? "—"}
                            {o.owner_email && (
                              <span className="block text-xs text-foreground-muted">{o.owner_email}</span>
                            )}
                          </Td>
                          <Td>
                            <Badge tone={STATUS_TONE[o.status] ?? "neutral"}>
                              {o.status.replace(/_/g, " ")}
                            </Badge>
                          </Td>
                          <Td>{formatDollars(o.assessed_value_cents)}</Td>
                          <Td>{formatDollars(o.requested_value_cents)}</Td>
                          <Td>{formatDollars(o.opinion_of_value_cents)}</Td>
                          <Td>{formatDate(o.created_at)}</Td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-foreground-muted">
                            No orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <h2 className="mt-10 text-lg font-semibold text-foreground">Activity</h2>
              <Card className="mt-4 divide-y divide-border p-0">
                {events.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-foreground">
                      {e.label}
                      <span className="ml-2 text-xs text-foreground-muted">
                        {e.entity_type} {e.entity_id.slice(0, 8)}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-xs text-foreground-muted">{formatDate(e.at)}</span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="px-5 py-6 text-center text-sm text-foreground-muted">No activity yet.</p>
                )}
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 text-foreground">{children}</td>;
}
