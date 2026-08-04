import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-[420px] px-6">
          <h1 className="text-center text-2xl font-bold text-foreground md:text-3xl">Log In</h1>
          <p className="mt-2 text-center text-sm text-foreground-muted">
            Welcome back. Enter your details to access your appeals.
          </p>

          <Card className="mt-8 p-6 md:p-8">
            <LoginForm />
          </Card>

          <p className="mt-6 text-center text-sm text-foreground-muted">
            <Link href="/" className="font-medium text-primary hover:underline">
              Continue without an account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
