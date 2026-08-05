const points = [
  {
    title: "Your data stays private",
    description:
      "Property and payment information is encrypted and never sold to third parties.",
  },
  {
    title: "Secure payments",
    description:
      "Checkout is handled by Stripe, the same payment processor used by major U.S. retailers.",
  },
  {
    title: "Built on public records",
    description:
      "Every recommendation is grounded in your county's own assessment and sales data.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="bg-surface-alt py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <h2 className="sr-only">Why you can trust Valuvia</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="flex gap-4">
              <ShieldIcon />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-9 w-9 flex-shrink-0 text-primary"
    >
      <path
        d="M12 2.5l7.5 3v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6l7.5-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2.2 2.2L15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
