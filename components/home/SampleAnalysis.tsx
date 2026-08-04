import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function SampleAnalysis() {
  return (
    <section className="bg-surface-alt py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            See what your report looks like
          </h2>
          <p className="mt-2 text-foreground-muted">
            An example analysis — yours is generated from your county&apos;s
            assessment records and real comparable sales.
          </p>
        </div>

        <Card className="mx-auto mt-10 max-w-[640px] p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Example property
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                1284 Almaden Expy, San Jose, CA
              </p>
            </div>
            <Badge tone="success">Appeal opportunity</Badge>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <p className="text-xs text-foreground-muted">Assessed value</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                $1,777,522.00
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Market estimate</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                $1,614,000.00
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Est. first-year savings</p>
              <p className="mt-1 text-xl font-bold text-accent-green">
                $1,909.00
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-foreground-muted">
            Based on 4 comparable sales within the same neighborhood over the
            last 6 months. Figures shown are illustrative only.
          </p>
        </Card>
      </div>
    </section>
  );
}
