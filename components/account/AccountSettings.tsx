'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
}

export default function AccountSettings() {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      try {
        const p = (await apiFetch('/api/v1/profile')) as Profile
        setProfile(p)
        setFullName(p.full_name ?? '')
        setPhone(p.phone ?? '')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      await apiFetch('/api/v1/profile', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: fullName, phone }),
      })
      setProfileMessage('Saved.')
    } catch {
      setProfileMessage('Could not save. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage(null)
    setPasswordError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordMessage('Password updated.')
      setNewPassword('')
    }
    setPasswordSaving(false)
  }

  async function handleManagePayment() {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const result = await apiFetch('/api/v1/billing/portal', { method: 'POST' })
      window.location.href = result.portal_url
    } catch {
      setPortalError('Payment management is temporarily unavailable. Please try again shortly.')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return <p className="text-center text-sm text-foreground-muted">Loading…</p>
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          </div>
          {profileMessage && <p className="text-sm text-foreground-muted">{profileMessage}</p>}
          <Button type="submit" disabled={profileSaving}>
            {profileSaving ? 'Saving…' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>

        {user?.is_anonymous ? (
          <div className="mt-4">
            <p className="text-sm text-foreground-muted">
              You&apos;re browsing without a saved account. Save your account to sign in from
              any device and set a password.
            </p>
            <Button href="/account/save" variant="secondary" className="mt-4">
              Save Your Account
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <Input value={profile?.email ?? user?.email ?? ''} disabled />
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-3">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                New password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                placeholder="Min 6 characters"
              />
              {passwordError && (
                <p className="rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
                  {passwordError}
                </p>
              )}
              {passwordMessage && <p className="text-sm text-foreground-muted">{passwordMessage}</p>}
              <Button type="submit" disabled={passwordSaving || newPassword.length < 6}>
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </div>
        )}
      </Card>

      <Card className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Manage your saved card and view billing history via our secure payment partner,
          Stripe.
        </p>
        {portalError && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-error-tint px-4 py-3 text-sm text-error">
            {portalError}
          </p>
        )}
        <Button onClick={handleManagePayment} disabled={portalLoading} className="mt-4">
          {portalLoading ? 'Opening…' : 'Manage Payment Method'}
        </Button>
      </Card>

      <p className="text-center text-sm">
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to your appeals
        </Link>
      </p>
    </div>
  )
}
