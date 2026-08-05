import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FunnelTracker from "@/components/analytics/FunnelTracker";
import QuickAppealCheck from "@/components/landing/QuickAppealCheck";
import AppealCriteriaContent from "@/components/landing/AppealCriteriaContent";
import LandingFAQ from "@/components/landing/LandingFAQ";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Should I Appeal My Property Tax Bill? Free Instant Check | Valuvia",
  description:
    "Not sure if a property tax appeal is worth it? Enter your county and assessed value for an instant check — free, no account needed, takes 10 seconds.",
  alternates: {
    canonical: "/should-i-appeal-property-taxes",
  },
  openGraph: {
    title: "Should I Appeal My Property Tax Bill?",
    description:
      "Enter your county and assessed value for an instant, free check on whether your property tax appeal is worth filing.",
    url: "/should-i-appeal-property-taxes",
    type: "website",
  },
};

export default function ShouldIAppealPage() {
  return (
    <>
      <FunnelTracker event="landing_viewed" properties={{ page: "should_i_appeal" }} />
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-10 md:px-8 md:py-20">
            <div>
              <h1 className="text-[2rem] leading-[1.15] font-bold text-foreground md:text-[2.5rem]">
                Should I appeal my property tax bill?
              </h1>
              <p className="mt-5 max-w-[520px] text-lg text-foreground-muted">
                If your county&apos;s assessed value is higher than what homes like yours
                actually sold for, the answer is usually yes. Check your specific property in
                10 seconds — no account, no address required.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-muted">
                <span>Free to check</span>
                <span>No downside — appeals can&apos;t raise your assessment</span>
              </div>
            </div>

            <QuickAppealCheck />
          </div>
        </section>

        <AppealCriteriaContent />

        <section className="border-y border-border bg-surface py-14 text-center">
          <div className="mx-auto max-w-[560px] px-6">
            <h2 className="text-xl font-bold text-foreground">
              Already know you want to appeal?
            </h2>
            <p className="mt-2 text-sm text-foreground-muted">
              Skip the check — get your property reviewed and your appeal package prepared for
              a flat $79.
            </p>
            <Button href="/#start" className="mt-5">
              Start My Appeal
            </Button>
          </div>
        </section>

        <LandingFAQ />
      </main>
      <Footer />
    </>
  );
}
