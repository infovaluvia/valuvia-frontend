"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
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
    <section className="border-t border-border bg-primary-tint py-16 md:py-20">
      <div className="mx-auto max-w-[640px] px-6 text-center md:px-8">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Ready to check your property?
        </h2>
        <p className="mt-2 text-foreground-muted">
          It takes about 2 minutes, and it&apos;s free to see your estimate.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-7 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your property address"
            aria-label="Property address"
            className="h-13 bg-white"
          />
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Check My Property
          </Button>
        </form>
      </div>
    </section>
  );
}
