export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_STYLES: Record<string, string> = {
  PLACED: 'bg-[#e4e9ff] text-[#2c3a7a]',
  PROCESSING: 'bg-[#ffdeae] text-[#5b3d00]',
  SHIPPED: 'bg-[#b1f2b4] text-[#0e4e21]',
  DELIVERED: 'bg-[#2e6a39] text-white',
  CANCELLED: 'bg-[#ffdad6] text-[#93000a]',
}

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status.replaceAll('_', ' ')
}

/** Index of the active step in ['Order placed', 'Processing', 'Shipped', 'Delivered']. */
export function orderTimelineStep(status: string) {
  switch (status) {
    case 'DELIVERED':
      return 3
    case 'SHIPPED':
      return 2
    case 'PROCESSING':
      return 1
    default:
      return 0
  }
}
