import Link from 'next/link'
import { Button } from '@bharatmart/ui'

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold text-[#7f5700]">Access denied</h1>
      <p className="text-sm text-[#514534]">
        You are signed in, but this account cannot access that area of BharatMart UK.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
          <Link href="/">Back to shop</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Use a different account</Link>
        </Button>
      </div>
    </main>
  )
}
