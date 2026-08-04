import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppealIntakeHero from "@/components/home/AppealIntakeHero";
import SampleAnalysis from "@/components/home/SampleAnalysis";
import ServiceChoices from "@/components/home/ServiceChoices";
import HowItWorks from "@/components/home/HowItWorks";
import SamplePackage from "@/components/home/SamplePackage";
import TrustSection from "@/components/home/TrustSection";
import Testimonials from "@/components/home/Testimonials";
import CountyCoverage from "@/components/home/CountyCoverage";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ address?: string }>;
}) {
  const { address } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AppealIntakeHero initialAddress={address ?? ""} />
        <SampleAnalysis />
        <ServiceChoices />
        <HowItWorks />
        <SamplePackage />
        <TrustSection />
        <Testimonials />
        <CountyCoverage />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
