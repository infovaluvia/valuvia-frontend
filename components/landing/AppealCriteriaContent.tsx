export default function AppealCriteriaContent() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[760px] px-6 md:px-8">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Should you appeal your property tax bill?
        </h2>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-foreground-muted">
          In most cases, yes — if your county&apos;s assessed value is higher than what
          comparable homes near you actually sold for recently. Appealing costs nothing to
          file yourself, can&apos;t raise your assessment, and a successful appeal lowers your
          property tax bill for that year and often the years after.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-accent-green/30 bg-accent-green/10 p-5">
            <h3 className="text-sm font-bold text-foreground">Appeal is likely worth it if:</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>Your assessed value is above recent comparable sales in your neighborhood</li>
              <li>Your assessed value jumped more than your state&apos;s statutory cap year-over-year</li>
              <li>You bought during a market peak and prices have since softened</li>
              <li>Your county&apos;s filing window is currently open</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-alt p-5">
            <h3 className="text-sm font-bold text-foreground">Appeal probably won&apos;t help if:</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>Your assessed value is already below what comparable homes are selling for</li>
              <li>Your county&apos;s filing deadline for this cycle has already passed</li>
              <li>Your assessment hasn&apos;t changed and local prices have risen, not fallen</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-foreground-muted">
          There&apos;s effectively no downside to checking: assessment appeals only ever reduce
          or leave your assessed value unchanged — they can&apos;t increase it. The main cost is
          time, and gathering comparable sales data yourself is the hardest part, which is what
          the quick check above (and Valuvia&apos;s $79 appeal package) does for you.
        </p>
      </div>
    </section>
  )
}
