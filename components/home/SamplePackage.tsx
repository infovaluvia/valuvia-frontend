import Card from "@/components/ui/Card";

const documents = [
  {
    label: "Official Application",
    title: "County Assessment Appeal Form",
    description:
      "Your official county appeal application, pre-filled with your property details, assessed value, and requested value — ready to sign and submit.",
  },
  {
    label: "Evidence Packet",
    title: "Hearing Evidence Packet",
    description:
      "A clean summary of comparable sales supporting your requested value, formatted to bring to your assessment appeals hearing.",
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
            Two documents, generated for your property and ready to file.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.title} className="overflow-hidden">
              <div className="flex h-40 items-center justify-center border-b border-border bg-surface-alt">
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
    <svg width="64" height="76" viewBox="0 0 64 76" fill="none">
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
