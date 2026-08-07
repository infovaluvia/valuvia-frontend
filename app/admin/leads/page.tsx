import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiFetchServer } from "@/lib/api-server";

export const metadata = {
  title: "Lead Quality — Admin — Valuvia",
  robots: { index: false, follow: false },
};

interface TierRow {
  tier: string;
  count: number;
  viewed: number;
  redeemed: number;
  view_rate: number | null;
  redemption_rate: number | null;
}

interface CountyRow {
  county: string;
  count: number;
  redeemed: number;
  redemption_rate: number | null;
  median_gap_pct: number | null;
}

interface LeadQuality {
  total_leads: number;
  scored_leads: number;
  unscored_leads: number;
  median_lead_score: number | null;
  tier_breakdown: TierRow[];
  county_breakdown: CountyRow[];
  source_batches: Record<string, number>;
}

const TIER_TONE: Record<string, "success" | "info" | "warning" | "neutral" | "error"> = {
  A: "success",
  B: "info",
  C: "warning",
  "Reject/Hold": "error",
  Unknown: "neutral",
};

function pct(value: number | null) {
  return value != null ? `${Math.round(value * 100)}%` : "—";
}

export default async function AdminLeadsPage() {
  let quality: LeadQuality | null = null;
  let error: string | null = null;

  try {
    quality = await apiFetchServer("/api/v1/admin/leads/quality");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load lead quality data";
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[1180px] px-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Lead Quality Review</h1>
              <p className="mt-1 text-sm text-foreground-muted">
                Leads pushed from the valuvia-leadgen pipeline, scored A/B/C/Reject by{" "}
                <code>scripts/process_propstream_leads.py</code>. Redemption rate by tier is the
                real test of whether the scoring is worth trusting — not just how many leads exist.
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/admin/leads/upload">Upload Leads</Button>
              <Button href="/admin" variant="secondary">
                Back to Admin
              </Button>
            </div>
          </div>

          {error ? (
            <Card className="mt-6 p-6 text-sm text-foreground-muted">
              {error.includes("403") ? (
                <>
                  You&apos;re signed in, but this account doesn&apos;t have admin access. Ask
                  someone with Supabase access to set your <code>profiles.role</code> to{" "}
                  <code>admin</code>.
                </>
              ) : (
                <>Couldn&apos;t load lead quality data: {error}</>
              )}
            </Card>
          ) : quality!.total_leads === 0 ? (
            <Card className="mt-6 p-8 text-center text-sm text-foreground-muted">
              No leads have been pushed yet. Run{" "}
              <code>scripts/push_leads_to_backend.py</code> from the valuvia-leadgen
              repo against a scored <code>*_clean.csv</code> or the master CSV.
            </Card>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatTile label="Total leads" value={String(quality!.total_leads)} />
                <StatTile label="Scored leads" value={String(quality!.scored_leads)} />
                <StatTile label="Unscored (legacy/manual)" value={String(quality!.unscored_leads)} />
                <StatTile
                  label="Median lead score"
                  value={quality!.median_lead_score != null ? String(quality!.median_lead_score) : "—"}
                  highlight
                />
              </div>

              <h2 className="mt-10 text-lg font-semibold text-foreground">Tier breakdown</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                If a higher tier isn&apos;t redeeming at a meaningfully higher rate than a lower
                one, the scoring thresholds in the pipeline need revisiting — this is exactly the
                calibration signal the leadgen docs flagged as still pending.
              </p>
              <Card className="mt-4 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-alt">
                        <Th>Tier</Th>
                        <Th>Count</Th>
                        <Th>Viewed</Th>
                        <Th>Redeemed</Th>
                        <Th>View rate</Th>
                        <Th>Redemption rate</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {quality!.tier_breakdown.map((t) => (
                        <tr key={t.tier} className="border-b border-border last:border-0">
                          <Td>
                            <Badge tone={TIER_TONE[t.tier] ?? "neutral"}>{t.tier}</Badge>
                          </Td>
                          <Td>{t.count}</Td>
                          <Td>{t.viewed}</Td>
                          <Td>{t.redeemed}</Td>
                          <Td>{pct(t.view_rate)}</Td>
                          <Td>{pct(t.redemption_rate)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <h2 className="mt-10 text-lg font-semibold text-foreground">County breakdown</h2>
              <Card className="mt-4 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-alt">
                        <Th>County</Th>
                        <Th>Count</Th>
                        <Th>Redeemed</Th>
                        <Th>Redemption rate</Th>
                        <Th>Median gap %</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {quality!.county_breakdown.map((c) => (
                        <tr key={c.county} className="border-b border-border last:border-0">
                          <Td>{c.county}</Td>
                          <Td>{c.count}</Td>
                          <Td>{c.redeemed}</Td>
                          <Td>{pct(c.redemption_rate)}</Td>
                          <Td>{c.median_gap_pct != null ? `${c.median_gap_pct}%` : "—"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <h2 className="mt-10 text-lg font-semibold text-foreground">Source batches</h2>
              <Card className="mt-4 p-5">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(quality!.source_batches).map(([batch, count]) => (
                    <Badge key={batch} tone="neutral">
                      {batch}: {count}
                    </Badge>
                  ))}
                </div>
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
