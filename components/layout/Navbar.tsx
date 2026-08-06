import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import OrderStatusButton from "@/components/layout/OrderStatusButton";
import { apiFetchServer } from "@/lib/api-server";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "Resources" },
];

interface OrderSummary {
  id: string;
  status: string;
}

async function getLatestOrder(): Promise<OrderSummary | null> {
  try {
    const orders = (await apiFetchServer("/api/v1/orders")) as OrderSummary[];
    return orders[0] ?? null;
  } catch {
    // The nav renders on every page — a flaky API call here shouldn't
    // take the whole page down, it should just hide the order button.
    return null;
  }
}

export default async function Navbar() {
  const latestOrder = await getLatestOrder();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5">
          {/* Explicit h-14/w-14 pins both dimensions in CSS — Tailwind's
              preflight (img { height: auto }) otherwise fights the
              width/height props and Next/Image warns about a mismatched
              aspect ratio. */}
          <Image
            src="/logo.png"
            alt="Valuvia"
            width={64}
            height={64}
            priority
            className="h-14 w-14"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[1.85rem] font-bold tracking-tight text-foreground">
              Valuvia
            </span>
            <span className="mt-1.5 text-[0.78rem] font-semibold tracking-wider text-foreground-muted">
              PROPERTY ASSESSMENT REVIEW
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-foreground-muted hover:text-foreground sm:block"
          >
            Sign In
          </Link>
          {latestOrder && <OrderStatusButton orderId={latestOrder.id} status={latestOrder.status} />}
          <Button href="/#start" size="md">
            Check My Property
          </Button>
          {/* <details>/<summary> gets open/close, Enter/Space toggling, and
              click-outside-to-close for free from the browser -- no custom
              JS needed for a menu this simple. Below md, the links above
              are hidden entirely with no other way to reach them, so this
              is the only path to How It Works / Pricing / Resources / Sign
              In on a phone-width screen. */}
          <details className="relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-sm)] text-foreground-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
            >
              <MenuIcon />
            </summary>
            <nav className="absolute right-0 top-[calc(100%+0.5rem)] flex w-48 flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-2 shadow-lg">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-alt hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-alt hover:text-foreground"
              >
                Sign In
              </Link>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
