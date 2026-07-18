import { redirect } from 'next/navigation'
import { MerchantService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export async function requireMerchant() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const merchant = await MerchantService.getByUserId(user.id)
  if (!merchant) redirect('/register-business')
  if (merchant.verificationStatus === 'PENDING') redirect('/verification-pending')
  if (merchant.verificationStatus === 'REJECTED') redirect('/verification-pending')

  return { user, merchant }
}
