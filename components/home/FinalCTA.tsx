"use client";

import Button from "@/components/ui/Button";

export default function FinalCTA() {
  function scrollToForm(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

        <Button href="/#start" onClick={scrollToForm} size="lg" className="mt-7">
          Check My Property
        </Button>
      </div>
    </section>
  );
}
