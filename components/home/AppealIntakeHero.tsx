import IntakeForm from "@/components/intake/IntakeForm";

export default function AppealIntakeHero({
  initialAddress = "",
  initialCode = "",
}: {
  initialAddress?: string;
  initialCode?: string;
}) {
  return (
    <section id="start" className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/25 via-[#6d8cf5]/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-accent-gold/20 via-accent-green/10 to-transparent blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1180px] gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:items-start md:gap-10 md:px-8 md:py-20">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary-tint px-4 py-1.5 text-sm font-semibold text-primary">
            Now supporting appeals nationwide
          </span>

          <h1 className="mt-6 text-[2.1rem] leading-[1.1] font-bold text-foreground md:text-[2.75rem]">
            Your home may be{" "}
            <span className="bg-gradient-to-r from-primary to-[#6d8cf5] bg-clip-text text-transparent">
              over-assessed
            </span>
            . Find out in minutes.
          </h1>

          <p className="mt-5 max-w-[480px] text-lg text-foreground-muted">
            Enter your address and assessed value — or upload your tax bill — for a free
            preliminary review and a recommendation on whether an appeal is worth pursuing.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon /> Free to check
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon /> Takes about 2 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon /> No account required
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-3">
            <TrustPoint icon={<ShieldIcon />} title="No upfront cost" subtitle="Pay only for what you order" />
            <TrustPoint icon={<LockIcon />} title="Your data is secure" subtitle="Encrypted, never shared" />
            <TrustPoint icon={<BuildingIcon />} title="County-specific expertise" subtitle="Built for local filing rules" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-6 right-4 z-10 hidden max-w-[190px] rotate-2 rounded-[var(--radius-md)] border border-border bg-surface p-3.5 shadow-md md:flex md:items-start md:gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-tint text-primary">
              <SparkleIcon />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">AI-Powered Analysis</p>
              <p className="mt-0.5 text-[0.7rem] leading-snug text-foreground-muted">
                We read your documents and compare recent sales for you.
              </p>
            </div>
          </div>

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

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-primary">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.5V10l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
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
