'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

// Root error boundary — without this, an unhandled error on any page
// (e.g. a failed server-side fetch) fell through to Next.js's generic
// unstyled default error page instead of a friendly, on-brand failure
// state.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-[420px] text-center">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          We couldn&apos;t load this page. Please try again, or head back home.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
          <Button href="/">Go home</Button>
        </div>
      </div>
    </main>
  )
}
