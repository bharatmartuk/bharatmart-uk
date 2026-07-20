'use client'

import { useState, useTransition } from 'react'
import { Button, Input } from '@bharatmart/ui'
import { adjustStockAction } from '@/app/(dashboard)/products/actions'

export function StockAdjuster({
  productId,
  stockQuantity,
}: {
  productId: string
  stockQuantity: number
}) {
  const [value, setValue] = useState(String(stockQuantity))
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-20"
        min={0}
        onChange={(event) => setValue(event.target.value)}
        type="number"
        value={value}
      />
      <Button
        disabled={pending || Number(value) === stockQuantity}
        onClick={() =>
          startTransition(async () => {
            await adjustStockAction(productId, Number(value))
          })
        }
        size="sm"
        type="button"
        variant="outline"
      >
        Update
      </Button>
    </div>
  )
}
