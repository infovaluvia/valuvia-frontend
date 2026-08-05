'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

// Fires one funnel event on mount, straight to Vercel Analytics -- this
// is the frontend half for events that happen before an order exists
// (so there's no order_id yet to attach a backend-tracked event to).
// Properties must never include an address, email, phone, or other
// sensitive value, same rule as the backend side (see backend
// app/services/analytics.py's FUNNEL_EVENTS), but note these
// frontend-only event names are NOT validated against that list --
// there's no shared runtime check across the two vocabularies, so
// naming has to stay disciplined by convention.
//
// UI Redesign Master Plan §14 proposed a broader event vocabulary
// (homepage_view, address_started, address_selected, address_submit_
// success, property_confirmed, preliminary_review_viewed,
// condition_step_started/completed, sample_package_viewed,
// checkout_started, checkout_completed, account_activated,
// package_ready_viewed, support_opened). Rather than a blind rename,
// existing V1-spec events are kept as-is and treated as equivalent:
// landing_viewed = homepage_view, screening_started ≈ address_started,
// address_submitted = address_submit_success, checkout_started
// (backend) = checkout_started, payment_succeeded (backend) ≈
// checkout_completed, package_delivered (backend) ≈
// package_ready_viewed. Net-new events actually wired up so far:
// property_confirmed (IntakeForm), condition_step_started/completed
// (ConditionIntakeForm), support_opened (ChatWidget), account_activated
// (CreateAccountForm). Not wired up: address_selected,
// preliminary_review_viewed, sample_package_viewed -- lower value or no
// natural single call site yet.
export default function FunnelTracker({
  event,
  properties,
}: {
  event: string
  properties?: Record<string, string | number | boolean>
}) {
  useEffect(() => {
    track(event, properties)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
