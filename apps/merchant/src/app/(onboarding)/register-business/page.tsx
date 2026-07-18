import { redirect } from 'next/navigation'
import { MerchantService } from '@bharatmart/services'
import { MerchantOnboardingForm } from '@/components/onboarding/MerchantOnboardingForm'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function RegisterBusinessPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/register-business')

  const merchant = await MerchantService.getByUserId(user.id)
  if (merchant) {
    redirect(
      merchant.verificationStatus === 'APPROVED' ? '/' : '/verification-pending',
    )
  }

  return <MerchantOnboardingForm />
}
