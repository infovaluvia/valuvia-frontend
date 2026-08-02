import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import IntakeForm from '@/components/intake/IntakeForm'

export default async function NewAppealPage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string }>
}) {
  const { address } = await searchParams

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface-alt py-12 md:py-16">
        <IntakeForm initialAddress={address ?? ''} />
      </main>
      <Footer />
    </>
  )
}
