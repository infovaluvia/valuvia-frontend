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
      <div className="mx-auto max-w-[1180px] px-6 py-20 text-center md:px-8 md:py-28">
        <span className="inline-flex items-center rounded-full bg-primary-tint px-4 py-1.5 text-sm font-semibold text-primary">
          Santa Clara County, CA — appeal window now open
        </span>

        <h1 className="mx-auto mt-6 max-w-[820px] text-[2.25rem] leading-[1.1] font-bold text-foreground md:text-[3.25rem]">
          Your home may be over-assessed. Find out in minutes.
        </h1>

        <p className="mx-auto mt-5 max-w-[560px] text-lg text-foreground-muted">
          Enter your address for a free preliminary review of your property
          tax assessment against recent comparable sales — no obligation,
          no upfront cost.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 flex max-w-[560px] flex-col gap-3 sm:flex-row"
        >
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

        <p className="mt-4 text-sm text-foreground-muted">
          Free to check &middot; Takes about 2 minutes &middot; No account
          required to see your estimate
        </p>
      </div>
    </section>
  );
}
