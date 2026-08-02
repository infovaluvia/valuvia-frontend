const faqs = [
  {
    q: "Is it worth appealing my property tax assessment?",
    a: "If your county's assessed value is higher than what comparable homes nearby actually sold for, you likely have a case. Even a modest reduction can save hundreds of dollars a year.",
  },
  {
    q: "How long does the appeal process take?",
    a: "Preparing your appeal package takes minutes once you have your assessment notice. The county's review and hearing process typically takes a few months, and varies by county.",
  },
  {
    q: "What if my appeal isn't successful?",
    a: "Assessment appeals do not increase your assessed value — the outcome is either a reduction or no change. There's no downside risk to filing.",
  },
  {
    q: "Do I need a lawyer?",
    a: "No. Most residential assessment appeals are handled directly by the homeowner using the forms and evidence your county requires — which is exactly what your appeal package includes.",
  },
  {
    q: "What documents do I need?",
    a: "Your most recent property tax bill or assessment notice, and basic details about your property (square footage, purchase price if recent, etc.).",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-[760px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-10 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
          {faqs.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[0.95rem] font-semibold text-foreground">
                {item.q}
                <span className="ml-4 flex-shrink-0 text-foreground-muted transition-transform group-open:rotate-45">
                  <PlusIcon />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path
        d="M8 2v12M2 8h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
