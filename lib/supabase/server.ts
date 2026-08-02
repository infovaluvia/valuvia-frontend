import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use this in Server Components / Route Handlers / Server Actions
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Calling setAll from a pure Server Component throws.
            // This can be safely ignored as long as proxy.ts is
            // refreshing the session.
          }
        },
      },
    }
  )
}
