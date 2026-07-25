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

  const isCustomerSession = user?.role === 'CUSTOMER'

  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        defaultRedirect="/"
        isCustomerSession={isCustomerSession}
        subtitle={
          isCustomerSession
            ? 'Finish seller registration or sign out to use a different merchant account.'
            : 'Sign in to your merchant account. New sellers can register from the link below.'
        }
        title="Merchant login"
      />
    </Suspense>
  )
}
