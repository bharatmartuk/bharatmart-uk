import { MerchantService } from '@bharatmart/services'
import { MerchantOnboardingForm } from '@/components/onboarding/MerchantOnboardingForm'
import { SellerAccountForm } from '@/components/onboarding/SellerAccountForm'
import { getCurrentUser } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RegisterBusinessPage() {
  const user = await getCurrentUser()
  if (!user) {
    return <SellerAccountForm />
  }

  const merchant = await MerchantService.getByUserId(user.id)
  if (merchant) {
    redirect(
      merchant.verificationStatus === 'APPROVED' ? '/' : '/verification-pending',
    )
  }

  return <MerchantOnboardingForm />
}
