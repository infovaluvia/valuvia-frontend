import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import LeadUploadForm from "@/components/admin/LeadUploadForm";

export const metadata = {
  title: "Upload Leads — Admin — Valuvia",
  robots: { index: false, follow: false },
};

export default function AdminLeadsUploadPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[720px] px-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Upload Leads</h1>
            <Button href="/admin/leads" variant="secondary">
              Back to Lead Quality
            </Button>
          </div>
          <p className="mt-2 text-sm text-foreground-muted">
            Pushes a scored CSV from the valuvia-leadgen pipeline straight into the leads table,
            entirely from this page — no local Python needed. Parsing and code generation happen
            in your browser; the CSV never leaves your machine except as the final request to the
            backend.
          </p>

          <LeadUploadForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
