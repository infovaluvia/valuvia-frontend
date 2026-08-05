'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        track('account_activated')
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>

      <Field label="Password" required hint="Min 6 characters">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Min 6 characters"
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-[var(--radius-sm)] bg-success-tint px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving…' : 'Save Account'}
      </Button>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="block w-full text-center text-sm text-foreground-muted hover:text-foreground"
      >
        Skip for now
      </button>
    </form>
  )
}
