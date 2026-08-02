import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const included = [
  "Comparable sales analysis for your property",
  "Officially formatted county appeal application, filled and ready to file",
  "Hearing evidence packet to bring to your appointment",
  "Step-by-step filing instructions for your county",
];

const fullServiceIncluded = [
  "Everything in Self-Service",
  "We file the appeal on your behalf",
  "A specialist represents you at your hearing",
  "You pay nothing unless we reduce your assessment",
];

export default function ServiceChoices() {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-foreground-muted">
            Choose the level of support that fits you. No hidden fees.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="flex flex-col p-7 md:p-8">
            <div className="flex items-center gap-2">
              <Badge tone="info">Self-Service Appeal Package</Badge>
              <Badge tone="success">Limited-time offer</Badge>
            </div>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-medium text-foreground-muted line-through">
                $99
              </span>
              <span className="text-4xl font-bold text-foreground">$79</span>
              <span className="text-base font-medium text-foreground-muted">
                flat fee
              </span>
            </p>
            <p className="mt-2 text-sm text-foreground-muted">
              We prepare everything — you file it.
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/appeal/new" className="mt-8 w-full">
              Get My Appeal Package — $79
            </Button>
          </Card>

          <Card className="flex flex-col border-primary/30 p-7 md:p-8">
            <Badge tone="neutral">Full-Service Appeal</Badge>
            <p className="mt-4 text-4xl font-bold text-foreground">
              Contingency
              <span className="block text-base font-medium text-foreground-muted">
                pay only if you save
              </span>
            </p>
            <p className="mt-2 text-sm text-foreground-muted">
              We handle the entire appeal, start to finish.
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {fullServiceIncluded.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/appeal/new" variant="secondary" className="mt-8 w-full">
              Join the Waitlist
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-green"
    >
      <path
        d="M4 10.5l3.5 3.5L16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
