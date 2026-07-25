import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { CredentialsLoginForm } from '@/components/credentials-login-form'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user?.role === 'MERCHANT') {
    redirect('/')
  }

  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        title="Merchant login"
        subtitle="Sign in to your merchant account. New sellers can register from the link below."
        defaultRedirect="/"
      />
    </Suspense>
  )
}
