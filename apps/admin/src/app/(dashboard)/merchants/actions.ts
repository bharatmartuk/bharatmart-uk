'use server'

import { revalidatePath } from 'next/cache'
import {
  MerchantService,
  NotificationService,
  ValidationError,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export async function approveMerchantAction(merchantId: string) {
  const admin = await getCurrentUser()
  if (!admin) return { ok: false as const, error: 'Unauthorized' }

  await MerchantService.setVerificationStatus(merchantId, 'APPROVED', admin.id)
  await NotificationService.notifyMerchantVerification(merchantId, 'APPROVED')
  revalidatePath('/')
  revalidatePath(`/merchants/${merchantId}`)
  return { ok: true as const }
}

export async function rejectMerchantAction(merchantId: string, reason: string) {
  const admin = await getCurrentUser()
  if (!admin) return { ok: false as const, error: 'Unauthorized' }

  try {
    await MerchantService.setVerificationStatus(merchantId, 'REJECTED', admin.id, reason)
    await NotificationService.notifyMerchantVerification(merchantId, 'REJECTED')
    revalidatePath('/')
    revalidatePath(`/merchants/${merchantId}`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to reject merchant.',
    }
  }
}
