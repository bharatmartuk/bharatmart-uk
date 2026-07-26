import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { MerchantService } from '@bharatmart/services'
import { CredentialsLoginForm } from '@/components/credentials-login-form'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  const merchant = user ? await MerchantService.getByUserId(user.id) : null

  // Only approved merchants skip login for the dashboard.
  if (user?.role === 'MERCHANT' && merchant?.verificationStatus === 'APPROVED') {
    redirect('/')
  }
  if (user?.role === 'MERCHANT' && merchant) {
    redirect('/verification-pending')
  }

  // CUSTOMER, or MERCHANT role without a store yet — stay on login.
  // Registration opens only when they click Continue / Register.
  const isIncompleteSeller = Boolean(user && !merchant)

  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        defaultRedirect="/"
        isCustomerSession={isIncompleteSeller}
        subtitle={
          isIncompleteSeller
            ? 'Finish seller registration or sign out to use a different merchant account.'
            : 'Sign in to your merchant account. New sellers can register from the link below.'
        }
        title="Merchant login"
      />
    </Suspense>
  )
}
