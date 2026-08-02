import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "Resources" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-sm font-bold text-white">
            V
          </span>
          <span className="text-[1.05rem] font-bold tracking-tight text-foreground">
            Valuvia
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
          <Button href="/appeal/new" size="md">
            Check My Property
          </Button>
        </div>
      </Container>
    </header>
  );
}
