import { redirect } from 'next/navigation'
import { MerchantService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

/**
 * Dashboard guard. Never auto-opens registration — incomplete sellers go to login
 * where they explicitly choose "Continue registration".
 */
export async function requireMerchant() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const merchant = await MerchantService.getByUserId(user.id)
  if (!merchant) redirect('/login?continueRegistration=1')
  if (merchant.verificationStatus === 'PENDING') redirect('/verification-pending')
  if (merchant.verificationStatus === 'REJECTED') redirect('/verification-pending')

  return { user, merchant }
}
