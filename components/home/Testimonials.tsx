import Card from "@/components/ui/Card";

// PLACEHOLDER CONTENT — replace with real, verified customer testimonials
// before this site is used for real marketing traffic.
const placeholderTestimonials = [
  {
    quote:
      "The process was straightforward — I uploaded my assessment notice and had a complete appeal package within a day.",
    name: "Homeowner",
    location: "San Jose, CA",
  },
  {
    quote:
      "I didn't know I could appeal my assessment. The comparable sales data made the case clear and easy to understand.",
    name: "Homeowner",
    location: "Sunnyvale, CA",
  },
  {
    quote:
      "Filing felt intimidating on my own. Having the official form already filled out saved me a lot of time.",
    name: "Homeowner",
    location: "Santa Clara, CA",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            What homeowners say
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {placeholderTestimonials.map((t) => (
            <Card key={t.name + t.location} className="p-6">
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {t.name}
              </p>
              <p className="text-xs text-foreground-muted">{t.location}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
