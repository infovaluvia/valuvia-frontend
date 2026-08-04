# Handoff — 高质量 Appeal Package session (as of 2026-08-04)

Read this first in any new session picking up this project — it's the
fastest way to get back to where this one left off. The backend repo
(`infovaluvia/valuvia-backend2`) has its own `HANDOFF.md` with the
backend-side status; this one covers the frontend.

## What exists now

- **Homepage IS the intake form.** `/appeal/new` just redirects to
  `/#start` now — `app/page.tsx` renders
  `components/home/AppealIntakeHero.tsx`, which embeds the full
  `components/intake/IntakeForm.tsx`. Only the property address is
  required up front; assessed value/owner name/email are optional
  there and collected later, right before checkout.
- **Google Places (New) autocomplete** (`lib/google-places.ts`) —
  address field auto-detects county/state. Uses the current
  `PlaceAutocompleteElement` API (needs "Places API (New)" enabled on
  the Google Cloud project, not the legacy "Places API"). Requires
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set in Vercel env vars — confirmed
  working on production as of this session.
- **Order review page** (`app/orders/[id]/page.tsx`) — screening
  verdict, "how the process works" explainer with real links (mailing
  address → Google Maps, filing portal → actual county URL), a
  "What You'll Get & How to Use It" package preview with a refund
  assurance line, then `CheckoutSection` with an "I Am Ready to Buy"
  button that only asks for missing name/email inline when clicked.
- **MoneyInput** (`components/ui/MoneyInput.tsx`) — formats on blur
  (not every keystroke) after a cursor-jump/corruption bug; all money
  values render as `$X,XXX.XX`.
- **"My Order" nav button** (`components/layout/OrderStatusButton.tsx`)
  — shows on every page via the async `Navbar.tsx`, links to the
  latest order.
- Login/account pages restyled to match the rest of the site
  (Navbar/Footer/Card/Input/Button) instead of raw inline styles.

## What's still open / known gaps

1. **Comps are still fake** (backend `comps.py` — proportional to
   assessed value). The "Comparable Properties" table on the order
   page and the market-value/savings stats are drafts, clearly labeled
   as such. This is the biggest thing between "draft package" and
   "real product" — see backend HANDOFF.md.
2. **Refund promise has no backend behind it yet.** The package
   preview card says "you'll get a full refund if the appeal is not
   successful" — nothing tracks outcomes or triggers a refund
   automatically. Needs a real feature or a manual process before
   that's an honored commitment.
3. **`lib/county-assessor-links.ts`** only has links for counties
   already seeded on the backend — if more counties get added there,
   add their public assessor property-search URL here too (used for
   the "Look up your assessed value" link on the intake form).
4. Two sessions needed for full-stack changes — this repo and
   `infovaluvia/valuvia-backend2` are separate; a mobile/cloud session
   only connects to one repo at a time.

## Key files to orient by

- `components/intake/IntakeForm.tsx` — the single-page intake (only
  address required)
- `components/home/AppealIntakeHero.tsx` — homepage hero wrapping the
  intake form
- `app/orders/[id]/page.tsx` — review/recommendation/checkout page
- `components/orders/CheckoutSection.tsx` + `CompleteDetailsForm.tsx`
  — buy button + inline name/email collection
- `lib/google-places.ts` + `types/google-maps.d.ts` — Places API
  integration
- `app/globals.css` — site-wide background/theme (recently reworked
  to be more visible/prettier per user feedback)
