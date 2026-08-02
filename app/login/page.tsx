import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <main style={{ padding: 40 }}>
      <LoginForm />
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href="/">Continue without an account</Link>
      </p>
    </main>
  )
}
