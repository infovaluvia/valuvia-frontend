'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Core component: upgrades the current anonymous account into a permanent
// account (sets email + password). Since the user id doesn't change,
// anything created while anonymous (uploads, generated files, etc.) is
// automatically retained — no data migration logic needed.
//
// Typical use case: shown right after a successful purchase/payment,
// prompting the user to "save their account".
export default function CreateAccountForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (currentUser?.is_anonymous) {
      // Upgrade the anonymous account into a permanent one; id stays the
      // same, so existing data is retained automatically.
      const { error } = await supabase.auth.updateUser({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account saved! You can now log in with this email and password on any device.')
      }
    } else {
      // Fallback: no anonymous session exists (e.g. cookies were cleared),
      // so fall back to a normal sign-up.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Please check your email to verify.')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '0 auto' }}>
      <h2>Save Your Account</h2>
      <p style={{ fontSize: 14, color: '#666' }}>
        Set an email and password so you can come back anytime to view or re-download your files.
      </p>

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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
        {loading ? 'Saving...' : 'Save Account'}
      </button>

      <p style={{ marginTop: 12, textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer' }}
        >
          Skip for now
        </button>
      </p>
    </form>
  )
}
