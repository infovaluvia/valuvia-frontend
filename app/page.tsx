import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FunnelTracker from "@/components/analytics/FunnelTracker";
import AppealIntakeHero from "@/components/home/AppealIntakeHero";
import SampleAnalysis from "@/components/home/SampleAnalysis";
import ServiceChoices from "@/components/home/ServiceChoices";
import HowItWorks from "@/components/home/HowItWorks";
import SamplePackage from "@/components/home/SamplePackage";
import TrustSection from "@/components/home/TrustSection";
import CountyCoverage from "@/components/home/CountyCoverage";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ address?: string; code?: string }>;
}) {
  const { address, code } = await searchParams;

  return (
    <>
      <FunnelTracker event="landing_viewed" properties={{ page: "home" }} />
      <Navbar />
      <main className="flex-1">
        <AppealIntakeHero initialAddress={address ?? ""} initialCode={code ?? ""} />
        <SampleAnalysis />
        <ServiceChoices />
        <HowItWorks />
        <SamplePackage />
        <TrustSection />
        <CountyCoverage />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
