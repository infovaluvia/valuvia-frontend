import { redirect } from 'next/navigation'

// The intake form now lives directly on the homepage (see app/page.tsx +
// components/home/AppealIntakeHero.tsx) so this route just forwards old
// links/bookmarks there, preserving the ?address= prefill param.
export default async function NewAppealPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string }>
}) {
  const { address } = await searchParams
  redirect(address ? `/?address=${encodeURIComponent(address)}#start` : '/#start')
}
