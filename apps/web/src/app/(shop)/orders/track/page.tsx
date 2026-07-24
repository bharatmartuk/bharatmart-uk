import { TrackOrderClient } from '@/components/orders/TrackOrderClient'

export const dynamic = 'force-dynamic'

export default function TrackOrderPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <h1 className="mb-6 font-heading text-3xl font-semibold">Track order</h1>
      <TrackOrderClient />
    </main>
  )
}
