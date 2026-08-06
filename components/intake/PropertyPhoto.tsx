'use client'

import { useEffect, useState } from 'react'

// Ownwell/AppealDesk-style "see your house" touch on the intake form.
// Street View coverage isn't universal (private roads, gated
// communities, areas Google's cars haven't driven) -- the metadata
// endpoint is free and tells us whether real imagery exists *before*
// we render an <img>, so a property with no coverage shows nothing
// instead of Google's generic gray "no imagery" placeholder graphic
// looking like a broken feature.
export default function PropertyPhoto({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || latitude == null || longitude == null) {
      setStatus('unavailable')
      return
    }
    let cancelled = false
    setStatus('checking')
    fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data.status === 'OK' ? 'available' : 'unavailable')
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  if (status !== 'available') return null

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const src = `https://maps.googleapis.com/maps/api/streetview?size=640x300&location=${latitude},${longitude}&key=${apiKey}`

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external,
    // key-gated Google API image, not a local/optimizable asset.
    <img
      src={src}
      alt="Street view of the property"
      className="mt-3 w-full rounded-[var(--radius-sm)] border border-border object-cover"
      style={{ aspectRatio: '640 / 300' }}
    />
  )
}
