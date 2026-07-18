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

  try {
    await MerchantService.setVerificationStatus(merchantId, 'APPROVED', admin.id)
    try {
      await NotificationService.notifyMerchantVerification(merchantId, 'APPROVED')
    } catch {
      // Approval should still succeed if email/notification delivery fails.
    }
    revalidatePath('/')
    revalidatePath('/merchants')
    revalidatePath(`/merchants/${merchantId}`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to approve merchant.',
    }
  }
}

export async function rejectMerchantAction(merchantId: string, reason: string) {
  const admin = await getCurrentUser()
  if (!admin) return { ok: false as const, error: 'Unauthorized' }

  try {
    await MerchantService.setVerificationStatus(merchantId, 'REJECTED', admin.id, reason)
    try {
      await NotificationService.notifyMerchantVerification(merchantId, 'REJECTED')
    } catch {
      // Rejection should still succeed if email/notification delivery fails.
    }
    revalidatePath('/')
    revalidatePath('/merchants')
    revalidatePath(`/merchants/${merchantId}`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to reject merchant.',
    }
  }
}
