'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

// Fires one funnel event on mount. Event names must match the V1 launch
// spec's fixed funnel vocabulary (see backend app/services/analytics.py's
// FUNNEL_EVENTS) -- this is the frontend half for events that happen
// before an order exists (so there's no order_id yet to attach a
// backend-tracked event to). Properties must never include an address,
// email, phone, or other sensitive value, same rule as the backend side.
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
