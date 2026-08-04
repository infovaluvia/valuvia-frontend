import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import IntakeForm from '@/components/intake/IntakeForm'

export default async function NewAppealPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string; code?: string }>
}) {
  const { address, code } = await searchParams

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface-alt py-12 md:py-16">
        <IntakeForm initialAddress={address ?? ''} lookupCode={code} />
      </main>
      <Footer />
    </>
  )
}
