import Card from "@/components/ui/Card";

const documents = [
  {
    label: "Official Application",
    title: "County Assessment Appeal Form",
    description:
      "Your official county appeal application, pre-filled with your property details, assessed value, and requested value — ready to sign and submit.",
  },
  {
    label: "Volume 1",
    title: "Executive Summary",
    description:
      "A decision-ready overview of your assessment, the market evidence, and our recommended course of action.",
  },
  {
    label: "Volume 2",
    title: "Government Filing Package",
    description:
      "A completion worksheet and submission checklist matched to your county's official application.",
  },
  {
    label: "Volume 3",
    title: "Comparable Sales Report",
    description:
      "The comparable sales behind your requested value, one per page with full facts and sourcing.",
  },
  {
    label: "Volume 4",
    title: "Property Condition Report",
    description:
      "Owner-reported condition observations, framed for the value-reducing adjustments they can support.",
  },
  {
    label: "Volume 5",
    title: "Evidence Book",
    description:
      "The full evidentiary record: property profile, assessment history, and adjustment framework.",
  },
  {
    label: "Volume 6",
    title: "Hearing Binder",
    description:
      "Opening statement, anticipated Board questions, and a recommended presentation order for your hearing.",
  },
];

export default function SamplePackage() {
  return (
    <section id="sample-package" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            What&apos;s in your appeal package
          </h2>
          <p className="mt-2 text-foreground-muted">
            Seven documents, generated for your property and ready to file.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.title} className="overflow-hidden">
              <div className="flex h-32 items-center justify-center border-b border-border bg-surface-alt">
                <DocumentGlyph />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {doc.label}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {doc.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {doc.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentGlyph() {
  return (
    <svg width="56" height="66" viewBox="0 0 64 76" fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="73"
        rx="6"
        fill="white"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <rect x="12" y="16" width="40" height="4" rx="2" fill="var(--primary-tint)" />
      <rect x="12" y="26" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="12" y="33" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="12" y="40" width="28" height="3" rx="1.5" fill="var(--border)" />
      <rect x="12" y="52" width="40" height="10" rx="3" fill="var(--accent-green-tint)" />
    </svg>
  );
}
