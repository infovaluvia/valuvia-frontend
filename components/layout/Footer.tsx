import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#sample-package", label: "Sample Package" },
      { href: "/#counties", label: "County Coverage" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/#trust", label: "Trust & Privacy" },
      { href: "/login", label: "Sign In" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/disclaimer", label: "Disclaimer" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Valuvia" width={24} height={24} />
              <span className="text-sm font-bold text-foreground">Valuvia</span>
            </div>
            <p className="mt-3 max-w-[220px] text-sm text-foreground-muted">
              Property tax appeal support for U.S. homeowners.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground-muted hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-foreground-muted">
            Valuvia is a property services technology platform and is not a
            law firm, does not provide legal advice, and is not affiliated
            with any government agency or county assessor&apos;s office.
            Estimated savings shown on this site are preliminary and based on
            available comparable sales data; actual results depend on your
            county&apos;s assessment appeals board and are not guaranteed.
            Filing deadlines vary by county — always confirm your local
            deadline before relying on any date shown here.
          </p>
          <p className="mt-4 text-xs text-foreground-muted">
            © {new Date().getFullYear()} Valuvia. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
