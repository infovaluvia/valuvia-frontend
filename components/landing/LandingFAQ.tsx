const faqs = [
  {
    q: 'Should I appeal my property tax bill?',
    a: "If your county's assessed value is higher than what comparable homes near you sold for recently, yes — you likely have a case worth filing. Use the quick check above to see if your county's filing window is open.",
  },
  {
    q: 'Is it worth appealing property taxes?',
    a: "Usually. Filing costs nothing to do yourself, can't raise your assessment, and a successful appeal reduces your tax bill. The main investment is time gathering comparable sales evidence — or a flat $79 to have it prepared for you.",
  },
  {
    q: 'What are the odds of winning a property tax appeal?',
    a: "It depends on how far your assessed value is above actual comparable sales. Appeals backed by solid recent comps in your immediate area succeed far more often than ones without evidence.",
  },
  {
    q: 'Does appealing my property taxes lower my home value?',
    a: 'No. A property tax appeal only affects the assessed value used to calculate your tax bill — it has no effect on your home\'s market value, sale price, or appraisal for a mortgage.',
  },
  {
    q: 'How much does it cost to appeal property taxes?',
    a: 'Most counties charge no fee (or a small one, typically under $100) to file an appeal yourself. Valuvia charges a flat $79 to prepare the paperwork and evidence package for you.',
  },
  {
    q: 'What is the deadline to appeal property taxes?',
    a: 'Deadlines are set per county — commonly September 15 or November 30, depending on the state and county. Check your specific county above; missing the window means waiting until the next filing cycle.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

export default function LandingFAQ() {
  return (
    <section className="bg-surface-alt py-16 md:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-[760px] px-6 md:px-8">
        <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
          Common questions
        </h2>

        <div className="mt-10 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
          {faqs.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[0.95rem] font-semibold text-foreground">
                {item.q}
                <span className="ml-4 flex-shrink-0 text-foreground-muted transition-transform group-open:rotate-45">
                  <PlusIcon />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
