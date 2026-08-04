import Link from "next/link";

const LABELS: Record<string, string> = {
  intake: "Continue Checkout",
  comps_review: "Continue Checkout",
  paid: "View Order",
  documents_generated: "My Documents",
  filed: "My Documents",
  hearing_scheduled: "My Documents",
  resolved: "My Documents",
  refunded: "My Order",
};

// "Needs action" mirrors what a cart badge means for a single flat-fee
// product: there's an order started but not yet paid for.
const NEEDS_ACTION = new Set(["intake", "comps_review"]);

export default function OrderStatusButton({ orderId, status }: { orderId: string; status: string }) {
  const label = LABELS[status] ?? "My Order";
  const needsAction = NEEDS_ACTION.has(status);

  return (
    <Link
      href={`/orders/${orderId}`}
      className="relative flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-3.5 text-sm font-semibold text-foreground-muted transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      <CartIcon />
      <span className="hidden sm:inline">{label}</span>
      {needsAction && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-green" />
      )}
    </Link>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5">
      <path
        d="M2.5 3h1.7l1 9.3a1.7 1.7 0 001.7 1.5h6.7a1.7 1.7 0 001.68-1.42l1-6.38H5.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="17" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
}
