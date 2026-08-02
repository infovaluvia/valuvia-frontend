'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// For existing users to log back in (e.g. on a new device/browser).
// Note: if the current browser already has an anonymous session (not yet
// upgraded), logging in here switches to the existing permanent account —
// the anonymous session's data does not carry over automatically. This is
// expected: logging in as a returning user means restoring their own
// original account and data.
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '0 auto' }}>
      <h2>Log In</h2>

      <div style={{ marginBottom: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
