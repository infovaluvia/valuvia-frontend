import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import CreateAccountForm from '@/components/auth/CreateAccountForm'

// Typical usage: redirect here after a successful payment
// (e.g. /account/save?from=checkout) so the user can optionally set a
// password to save their account, or skip.
export default function SaveAccountPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[420px] px-6">
          <h1 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            Save Your Account
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-muted">
            Set an email and password so you can come back anytime to view or re-download your files.
          </p>

          <Card className="mt-8 p-6 md:p-8">
            <CreateAccountForm />
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
