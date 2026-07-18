'use server'

import { revalidatePath } from 'next/cache'
import { MerchantOrderService, ValidationError } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'

export async function updateOrderStatusAction(
  merchantOrderId: string,
  newStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  trackingInfo?: { trackingNumber?: string; courierName?: string },
) {
  const { merchant } = await requireMerchant()
  try {
    await MerchantOrderService.updateStatus(
      merchantOrderId,
      merchant.id,
      newStatus,
      trackingInfo,
    )
    revalidatePath('/orders')
    revalidatePath(`/orders/${merchantOrderId}`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to update status.',
    }
  }
}
