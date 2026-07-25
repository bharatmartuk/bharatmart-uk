export type MerchantOrderStatus =
  | 'PLACED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export const ORDER_STATUS_LABELS: Record<MerchantOrderStatus, string> = {
  PLACED: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

/** Statuses a merchant may move an order to from its current status. */
export const NEXT_ORDER_STATUSES: Record<MerchantOrderStatus, MerchantOrderStatus[]> = {
  PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status as MerchantOrderStatus] ?? status
}
