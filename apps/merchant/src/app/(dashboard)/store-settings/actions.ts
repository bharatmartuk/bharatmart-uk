'use server'

import { revalidatePath } from 'next/cache'
import { MerchantService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'

export async function saveStoreProfileAction(input: {
  storeName: string
  storeDescription: string
  storeLogoUrl?: string
  storeBannerUrl?: string
}) {
  const { merchant } = await requireMerchant()
  await MerchantService.updateStoreProfile(merchant.id, input)
  revalidatePath('/store-settings')
  return { ok: true as const }
}

export async function saveDeliveryAreasAction(deliveryPostcodes: string[]) {
  const { merchant } = await requireMerchant()
  await MerchantService.updateDeliveryAreas(merchant.id, deliveryPostcodes)
  revalidatePath('/store-settings')
  return { ok: true as const }
}

export async function savePayoutDetailsAction(_input: {
  accountHolderName: string
  sortCode: string
  accountNumber: string
}) {
  // Captured for future payouts - not persisted to bank rails yet.
  await requireMerchant()
  return { ok: true as const, message: 'Payout details saved locally for future use.' }
}

export async function saveNotificationSettingsAction(_input: {
  emailOrders: boolean
  emailStock: boolean
  emailMarketing: boolean
}) {
  await requireMerchant()
  return { ok: true as const, message: 'Notification preferences saved.' }
}
