import IntakeForm from "@/components/intake/IntakeForm";

export default function AppealIntakeHero({
  initialAddress = "",
  initialCode = "",
}: {
  initialAddress?: string;
  initialCode?: string;
}) {
  return (
    <section id="start" className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:items-start md:gap-10 md:px-8 md:py-20">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary-tint px-4 py-1.5 text-sm font-semibold text-primary">
            Now serving Santa Clara County, CA
          </span>

          <h1 className="mt-6 text-[2.1rem] leading-[1.1] font-bold text-foreground md:text-[2.75rem]">
            Think Your 2026 Santa Clara County Property Assessment May Be Too High?
          </h1>

          <p className="mt-5 max-w-[480px] text-lg text-foreground-muted">
            Get an independent preliminary review before deciding whether an assessment appeal is
            worth pursuing.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon /> No payment required for the initial screening
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon /> Owner files directly
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon /> No government affiliation
            </span>
          </div>
          <p className="mt-2 text-xs text-foreground-muted">
            Results are estimates, not guarantees.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <TrustPoint icon={<ShieldIcon />} title="No upfront cost" subtitle="Pay only for what you order" />
            <TrustPoint icon={<LockIcon />} title="Your data is secure" subtitle="Encrypted, never shared" />
            <TrustPoint icon={<BuildingIcon />} title="County-specific expertise" subtitle="Built for local filing rules" />
          </div>
        </div>

        <div>
          <IntakeForm initialAddress={initialAddress} initialCode={initialCode} />
        </div>
      </div>
    </section>
  );
}

function TrustPoint({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-foreground-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-accent-green">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M12 2.5l7.5 3v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6l7.5-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
