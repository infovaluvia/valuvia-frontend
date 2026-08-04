// Loads the Google Maps JS API and the (New) Places library on demand,
// using Google's official dynamic bootstrap loader + importLibrary().
// Returns null immediately if no API key is configured, so callers can
// fall back to a plain text input instead of breaking the page.
let loadPromise: Promise<typeof google.maps.places | null> | null = null

declare global {
  interface Window {
    google?: typeof google
  }
}

// Google's official inline bootstrap snippet (minified, as published in
// their docs) — defines google.maps.importLibrary before the real API
// script has loaded, so importLibrary() itself triggers the actual
// network load the first time it's called.
function injectBootstrapLoader(apiKey: string) {
  ;(function (
    g: Record<string, unknown> & { maps?: Record<string, unknown> }
  ) {
    let h: Promise<unknown> | undefined
    const p = 'The Google Maps JavaScript API'
    const c = 'google'
    const l = 'importLibrary'
    const q = '__ib__'
    const m = document
    const w = window as unknown as Record<string, unknown>
    const b = (w[c] as Record<string, unknown>) || (w[c] = {})
    const d = (b.maps as Record<string, unknown>) || (b.maps = {})
    const r = new Set<string>()
    const e = new URLSearchParams()
    const u = () =>
      h ||
      (h = new Promise((resolve, reject) => {
        const script = m.createElement('script')
        e.set('libraries', [...r].join(','))
        for (const k in g) {
          e.set(k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()), String(g[k]))
        }
        e.set('callback', `${c}.maps.${q}`)
        script.src = `https://maps.${c}apis.com/maps/api/js?` + e.toString()
        ;(d as Record<string, unknown>)[q] = resolve
        script.onerror = () => {
          h = undefined
          reject(new Error(p + ' could not load.'))
        }
        script.nonce = m.querySelector('script[nonce]')?.getAttribute('nonce') || ''
        m.head.append(script)
      }))
    if (d[l]) {
      console.warn(p + ' only loads once. Ignoring:', g)
    } else {
      d[l] = (f: string, ...n: unknown[]) => (r.add(f), u().then(() => (d[l] as (...a: unknown[]) => unknown)(f, ...n)))
    }
  })({ key: apiKey, v: 'weekly' })
}

export function loadGooglePlaces(): Promise<typeof google.maps.places | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return Promise.resolve(null)

  if (!loadPromise) {
    if (!window.google?.maps?.importLibrary) {
      injectBootstrapLoader(apiKey)
    }
    loadPromise = window.google!.maps
      .importLibrary('places')
      .then(() => window.google!.maps.places)
  }
  return loadPromise
}

export interface ParsedAddress {
  formattedAddress: string
  street: string
  city: string
  county: string
  state: string
  zip: string
}

export function parsePlaceAddressComponents(
  components: google.maps.places.PlaceAddressComponent[],
  formattedAddress: string
): ParsedAddress {
  const get = (type: string, useShort = false) => {
    const c = components.find((c) => c.types.includes(type))
    return c ? (useShort ? c.shortText : c.longText) : ''
  }
  const streetNumber = get('street_number')
  const route = get('route')
  return {
    formattedAddress,
    street: [streetNumber, route].filter(Boolean).join(' '),
    city: get('locality') || get('sublocality') || get('postal_town'),
    county: get('administrative_area_level_2').replace(/\s+County$/i, ''),
    state: get('administrative_area_level_1', true),
    zip: get('postal_code'),
  }
}
