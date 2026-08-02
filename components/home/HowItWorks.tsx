const steps = [
  {
    number: "1",
    title: "Check your address",
    description:
      "We compare your assessed value against recent comparable sales in your neighborhood.",
  },
  {
    number: "2",
    title: "Answer a few questions",
    description:
      "Upload your assessment notice and tell us a bit about your property — takes about 5 minutes.",
  },
  {
    number: "3",
    title: "Get your appeal package",
    description:
      "We generate your official county appeal form and hearing evidence packet, ready to file.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-alt py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-foreground-muted">
            From address to appeal package in three steps.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.number} className="text-center md:text-left">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {s.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
