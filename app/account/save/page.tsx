import CreateAccountForm from '@/components/auth/CreateAccountForm'

// Typical usage: redirect here after a successful payment
// (e.g. /account/save?from=checkout) so the user can optionally set a
// password to save their account, or skip.
export default function SaveAccountPage() {
  return (
    <main style={{ padding: 40 }}>
      <CreateAccountForm />
    </main>
  )
}
