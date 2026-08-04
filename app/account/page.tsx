import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AccountSettings from '@/components/account/AccountSettings'

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-10 md:py-14">
        <div className="mx-auto max-w-[640px] px-6">
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage your profile, account, and payment information.
          </p>
          <div className="mt-8">
            <AccountSettings />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
