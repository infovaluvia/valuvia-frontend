"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Hero() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = address.trim()
      ? `?address=${encodeURIComponent(address.trim())}`
      : "";
    router.push(`/appeal/new${params}`);
  }

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:px-8 md:py-24">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary-tint px-4 py-1.5 text-sm font-semibold text-primary">
            Santa Clara County, CA — appeal window now open
          </span>

          <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-bold text-foreground md:text-[3rem]">
            Your home may be{" "}
            <span className="bg-gradient-to-r from-primary to-[#6d8cf5] bg-clip-text text-transparent">
              over-assessed
            </span>
            . Find out in minutes.
          </h1>

          <p className="mt-5 max-w-[520px] text-lg text-foreground-muted">
            Enter your address for a free preliminary review of your property
            tax assessment against recent comparable sales — no obligation,
            no upfront cost.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your property address"
              aria-label="Property address"
              className="h-14 text-base"
            />
            <Button type="submit" size="lg" className="h-14 w-full sm:w-auto">
              Check My Property
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-muted">
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
        </div>

        <HeroPanel />
      </div>

      <div className="border-t border-border bg-surface-alt">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-3 md:px-8">
          <TrustPoint icon={<ShieldIcon />} title="No upfront cost" subtitle="Pay only for what you order" />
          <TrustPoint icon={<LockIcon />} title="Your data is secure" subtitle="Encrypted, never shared" />
          <TrustPoint icon={<BuildingIcon />} title="County-specific expertise" subtitle="Built for local filing rules" />
        </div>
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-[#0f1b33] via-[#16244a] to-[#1f4fd6] p-8 shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" />
        <HouseIllustration />
      </div>

      <div className="absolute -top-5 left-1/2 w-[85%] -translate-x-1/2 rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-md sm:left-6 sm:w-auto sm:translate-x-0">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-tint text-primary">
            <SparkleIcon />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">AI-Powered Analysis</p>
            <p className="mt-0.5 max-w-[200px] text-xs text-foreground-muted">
              We analyze recent comparable sales to estimate your true market value.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 right-4 w-[75%] max-w-[240px] rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-md sm:right-6">
        <p className="text-xs font-medium text-foreground-muted">Example: Potential Savings</p>
        <p className="mt-1 text-2xl font-bold text-accent-green">$1,909</p>
        <p className="mt-1 text-xs text-foreground-muted">Based on illustrative sample data</p>
      </div>
    </div>
  );
}

function HouseIllustration() {
  return (
    <svg viewBox="0 0 300 220" fill="none" className="h-auto w-full">
      <rect x="40" y="110" width="220" height="90" rx="4" fill="rgba(255,255,255,0.08)" />
      <path d="M30 118L150 50L270 118" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="65" y="130" width="40" height="40" rx="3" fill="#B8860B" opacity="0.85" />
      <rect x="130" y="130" width="40" height="40" rx="3" fill="rgba(255,255,255,0.16)" />
      <rect x="195" y="130" width="40" height="40" rx="3" fill="#B8860B" opacity="0.5" />
      <rect x="140" y="170" width="20" height="30" rx="2" fill="rgba(255,255,255,0.22)" />
      <line x1="20" y1="200" x2="280" y2="200" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    </svg>
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

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
      <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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
