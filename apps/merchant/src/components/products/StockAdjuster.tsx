'use client'

import { useState, useTransition } from 'react'
import { Button, Input } from '@bharatmart/ui'
import { adjustStockAction } from '@/app/(dashboard)/products/actions'

const LOW_STOCK_THRESHOLD = 5

function stockLabel(quantity: number) {
  if (quantity <= 0) return { text: 'Out of stock', className: 'text-[#a83635]' }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return { text: 'Low stock', className: 'text-[#9a6700]' }
  }
  return { text: 'In stock', className: 'text-[#2e6a39]' }
}

export function StockAdjuster({
  productId,
  stockQuantity,
}: {
  productId: string
  stockQuantity: number
}) {
  const [value, setValue] = useState(String(stockQuantity))
  const [pending, startTransition] = useTransition()
  const label = stockLabel(stockQuantity)
  const numeric = Number(value)
  const unchanged = Number.isFinite(numeric) && numeric === stockQuantity

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          aria-label={`Stock quantity for product ${productId}`}
          className="h-8 w-[4.5rem] border-[#d6c4ad] bg-white"
          min={0}
          onChange={(event) => setValue(event.target.value)}
          type="number"
          value={value}
        />
        <span className="text-sm font-medium text-[#1e1b16]">units</span>
        <Button
          className="h-8 border-[#d6c4ad] px-2 text-xs"
          disabled={pending || unchanged || !Number.isFinite(numeric) || numeric < 0}
          onClick={() =>
            startTransition(async () => {
              await adjustStockAction(productId, Number(value))
            })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          {pending ? '…' : 'Update'}
        </Button>
      </div>
      <p className={`text-xs font-medium ${label.className}`}>{label.text}</p>
    </div>
  )
}
