import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // In theory `user` should never be null (proxy.ts auto-creates an
  // anonymous session), but keep this fallback in case proxy didn't run
  // or errored, so the page doesn't crash.
  if (!user) {
    redirect('/login')
  }

  return (
    <main style={{ padding: 40 }}>
      {user.is_anonymous ? (
        <>
          <h1>Welcome, guest</h1>
          <p style={{ color: '#666' }}>
            You're browsing without an account. Your files are saved for this session —{' '}
            <Link href="/account/save">save your account</Link> to access them later from
            any device.
          </p>
        </>
      ) : (
        <h1>Welcome, {user.email}</h1>
      )}
      <SignOutButton />
    </main>
  )
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit">Log Out</button>
    </form>
  )
}
