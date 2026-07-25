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

/** Badge styling per status for merchant-facing screens. */
export const ORDER_STATUS_BADGE: Record<MerchantOrderStatus, { className: string; dot: string }> = {
  PLACED: { className: 'bg-[#e4e9ff] text-[#2c3a7a]', dot: 'bg-[#3a4ba0]' },
  PROCESSING: { className: 'bg-[#ffdeae] text-[#5b3d00]', dot: 'bg-[#9a6700]' },
  SHIPPED: { className: 'bg-[#dbeafe] text-[#1e4b8f]', dot: 'bg-[#2563c9]' },
  DELIVERED: { className: 'bg-[#b1f2b4] text-[#0e4e21]', dot: 'bg-[#2e6a39]' },
  CANCELLED: { className: 'bg-[#ffdad6] text-[#93000a]', dot: 'bg-[#a83635]' },
}

export function orderStatusBadge(status: string) {
  return (
    ORDER_STATUS_BADGE[status as MerchantOrderStatus] ?? {
      className: 'bg-[#eee7de] text-[#514534]',
      dot: 'bg-[#837561]',
    }
  )
}

/** Contextual copy shown next to the status selector. */
export const ORDER_STATUS_HINTS: Record<MerchantOrderStatus, string> = {
  PLACED: 'The order is placed and waiting for you to start processing.',
  PROCESSING: 'The customer will be notified that you are preparing their order.',
  SHIPPED: 'The customer will be notified about the shipment.',
  DELIVERED: 'This order will be marked as completed.',
  CANCELLED: 'This order will be cancelled and the customer notified.',
}

export function orderStatusHint(status: string) {
  return ORDER_STATUS_HINTS[status as MerchantOrderStatus] ?? ''
}

/** Common UK couriers offered in the status form (free-text still allowed). */
export const COURIER_OPTIONS = [
  'Royal Mail',
  'Evri',
  'DPD',
  'DHL',
  'UPS',
  'FedEx',
  'Yodel',
  'Parcelforce',
  'Amazon Logistics',
] as const
