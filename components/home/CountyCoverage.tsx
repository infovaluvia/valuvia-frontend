import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { apiFetchServer } from "@/lib/api-server";

interface Jurisdiction {
  name: string;
  filing_window_start: string | null;
  filing_window_end: string | null;
}

function formatWindow(startIso: string | null, endIso: string | null): { label: string; open: boolean } {
  if (!startIso || !endIso) return { label: "Filing window not yet confirmed", open: false };
  const start = new Date(startIso);
  const end = new Date(endIso);
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    label: `Filing window: ${fmt(start)} – ${fmt(end)}`,
    open: now >= start && now <= end,
  };
}

export default async function CountyCoverage() {
  let jurisdictions: Jurisdiction[] = [];
  try {
    jurisdictions = await apiFetchServer("/api/v1/jurisdictions");
  } catch {
    // Section just renders empty rather than breaking the homepage if
    // the API is briefly unreachable -- coverage list, not critical path.
  }
  const sorted = [...jurisdictions].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section id="counties" className="bg-surface-alt py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            County coverage
          </h2>
          <p className="mt-2 text-foreground-muted">
            Each county sets its own appeal deadline and filing rules.
          </p>
        </div>

        {sorted.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((c) => {
              const { label, open } = formatWindow(c.filing_window_start, c.filing_window_end);
              return (
                <Card key={c.name} className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">{label}</p>
                  </div>
                  <Badge tone={open ? "success" : "neutral"}>{open ? "Open now" : "Not open"}</Badge>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
