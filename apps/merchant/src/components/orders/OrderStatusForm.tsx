'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@bharatmart/ui'
import { updateOrderStatusAction } from '@/app/(dashboard)/orders/actions'
import {
  NEXT_ORDER_STATUSES,
  orderStatusLabel,
  type MerchantOrderStatus,
} from '@/lib/order-status'

export function OrderStatusForm({
  merchantOrderId,
  currentStatus,
}: {
  merchantOrderId: string
  currentStatus: string
}) {
  const options = NEXT_ORDER_STATUSES[currentStatus as MerchantOrderStatus] ?? []
  const [status, setStatus] = useState(options[0] ?? currentStatus)
  // Keep the selection valid after the order advances and the page revalidates.
  const selected = options.includes(status as MerchantOrderStatus)
    ? (status as MerchantOrderStatus)
    : (options[0] ?? (currentStatus as MerchantOrderStatus))
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-3 rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4">
      <div className="space-y-2">
        <Label>Update status</Label>
        <p className="text-xs text-[#837561]">Current: {orderStatusLabel(currentStatus)}</p>
        {options.length === 0 ? (
          <p className="text-sm text-[#514534]">This order is closed and cannot be updated.</p>
        ) : (
          <select
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
            onChange={(event) => setStatus(event.target.value as MerchantOrderStatus)}
            value={selected}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {orderStatusLabel(option)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tracking number</Label>
          <Input onChange={(event) => setTrackingNumber(event.target.value)} value={trackingNumber} />
        </div>
        <div className="space-y-2">
          <Label>Courier</Label>
          <Input onChange={(event) => setCourierName(event.target.value)} value={courierName} />
        </div>
      </div>
      <Button
        className="bg-[#7f5700] text-white hover:bg-[#604100]"
        disabled={pending || options.length === 0}
        onClick={() =>
          startTransition(async () => {
            const result = await updateOrderStatusAction(
              merchantOrderId,
              selected,
              {
                ...(trackingNumber ? { trackingNumber } : {}),
                ...(courierName ? { courierName } : {}),
              },
            )
            setMessage(result.ok ? 'Status updated.' : result.error)
          })
        }
        type="button"
      >
        Save status
      </Button>
      <Button disabled title="Coming soon" type="button" variant="outline">
        Generate invoice
      </Button>
      {message ? <p className="text-sm text-[#514534]">{message}</p> : null}
    </div>
  )
}
