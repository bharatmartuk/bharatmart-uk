const LOW_STOCK_THRESHOLD = 5

export type ProductListStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'

export function displayStockStatus(status: string, stockQuantity: number) {
  if (status === 'DRAFT') {
    return {
      label: 'Draft',
      className: 'bg-[#eee7de] text-[#514534]',
      dot: 'bg-[#837561]',
    }
  }
  if (status === 'ARCHIVED') {
    return {
      label: 'Archived',
      className: 'bg-[#eee7de] text-[#514534]',
      dot: 'bg-[#837561]',
    }
  }
  if (status === 'OUT_OF_STOCK' || stockQuantity <= 0) {
    return {
      label: 'Out of stock',
      className: 'bg-[#ffdad6] text-[#93000a]',
      dot: 'bg-[#a83635]',
    }
  }
  if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    return {
      label: 'Low stock',
      className: 'bg-[#ffdeae] text-[#5b3d00]',
      dot: 'bg-[#9a6700]',
    }
  }
  return {
    label: 'Active',
    className: 'bg-[#b1f2b4] text-[#0e4e21]',
    dot: 'bg-[#2e6a39]',
  }
}

export function ProductStatusBadge({
  status,
  stockQuantity,
}: {
  status: string
  stockQuantity: number
}) {
  const badge = displayStockStatus(status, stockQuantity)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  )
}
