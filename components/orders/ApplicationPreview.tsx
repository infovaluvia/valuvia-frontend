'use client'

import { useState } from 'react'
import { apiFetchBlob } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ApplicationPreview({ orderId }: { orderId: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePreview() {
    setError(null)
    setLoading(true)
    try {
      const blob = await apiFetchBlob(`/api/v1/orders/${orderId}/documents/preview`)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load preview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-semibold text-foreground">See Your Actual Application</h2>
      <Card className="mt-4 p-6 md:p-8">
        <p className="text-sm text-foreground">
          This is the real official form we&apos;ll fill out for your property — pre-filled with
          your name, address, and assessed value straight from the county roll.
        </p>
        <p className="mt-2 text-sm text-foreground-muted">
          Your parcel number, opinion of value, and signature line are blanked out here — those
          (plus your 6 supporting volumes) unlock once you purchase your package.
        </p>

        {previewUrl ? (
          <div className="mt-5 overflow-hidden rounded-[var(--radius-sm)] border border-border">
            <iframe src={previewUrl} className="h-[600px] w-full" title="Application preview" />
          </div>
        ) : (
          <Button onClick={handlePreview} variant="secondary" className="mt-5 w-full" disabled={loading}>
            {loading ? 'Loading preview…' : 'Preview My Application'}
          </Button>
        )}

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </Card>
    </>
  )
}
