import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import { apiFetchServer } from "@/lib/api-server";
import QAQueue from "@/components/admin/QAQueue";

export const metadata = {
  title: "QA Review — Valuvia Admin",
  robots: { index: false, follow: false },
};

export interface QAOrder {
  id: string;
  status: string;
  assessed_value_cents: number | null;
  requested_value_cents: number | null;
  opinion_of_value_cents: number | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  property_type: string | null;
  situs_address: string | null;
}

export default async function QAReviewPage() {
  let orders: QAOrder[] = [];
  let checklistItems: Record<string, string> = {};
  let checklistVersion = "";
  let error: string | null = null;

  try {
    const [queueRes, checklistRes] = await Promise.all([
      apiFetchServer("/api/v1/admin/qa/queue"),
      apiFetchServer("/api/v1/admin/qa/checklist"),
    ]);
    orders = queueRes.orders;
    checklistItems = checklistRes.items;
    checklistVersion = checklistRes.version;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load the QA queue";
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[900px] px-6 md:px-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">QA Review Queue</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Every paid package generated below is held here until an authenticated reviewer
            completes the checklist and approves it — nothing is delivered to the customer until
            then.
          </p>

          {error ? (
            <Card className="mt-6 p-6 text-sm text-foreground-muted">
              {error.includes("403") ? (
                <>
                  You&apos;re signed in, but this account doesn&apos;t have admin access. Ask
                  someone with Supabase access to set your <code>profiles.role</code> to{" "}
                  <code>admin</code> or <code>staff</code>.
                </>
              ) : (
                <>Couldn&apos;t load the QA queue: {error}</>
              )}
            </Card>
          ) : (
            <QAQueue initialOrders={orders} checklistItems={checklistItems} checklistVersion={checklistVersion} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
