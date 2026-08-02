import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const counties = [
  {
    name: "Santa Clara County, CA",
    status: "active" as const,
    window: "Filing window: Jul 2 – Sep 15",
  },
  { name: "Alameda County, CA", status: "coming" as const, window: "Coming soon" },
  { name: "San Mateo County, CA", status: "coming" as const, window: "Coming soon" },
  { name: "Los Angeles County, CA", status: "coming" as const, window: "Coming soon" },
];

export default function CountyCoverage() {
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

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {counties.map((c) => (
            <Card
              key={c.name}
              className="flex items-center justify-between p-5"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {c.name}
                </p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {c.window}
                </p>
              </div>
              <Badge tone={c.status === "active" ? "success" : "neutral"}>
                {c.status === "active" ? "Open now" : "Coming soon"}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
