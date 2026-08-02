import Image from "next/image";
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
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Valuvia" width={34} height={34} priority />
          <span className="flex flex-col leading-none">
            <span className="text-[1.15rem] font-bold tracking-tight text-foreground">
              Valuvia
            </span>
            <span className="mt-0.5 text-[0.6rem] font-semibold tracking-wide text-foreground-muted">
              AI-POWERED PROPERTY TAX APPEALS
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
          <Button href="/appeal/new" size="md">
            Check My Property
          </Button>
        </div>
      </Container>
    </header>
  );
}
