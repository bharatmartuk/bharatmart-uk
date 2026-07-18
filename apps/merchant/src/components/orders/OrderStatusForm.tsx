'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@bharatmart/ui'
import { updateOrderStatusAction } from '@/app/(dashboard)/orders/actions'

export function OrderStatusForm({
  merchantOrderId,
  currentStatus,
}: {
  merchantOrderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-3 rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4">
      <div className="space-y-2">
        <Label>Update status</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
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
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateOrderStatusAction(
              merchantOrderId,
              status as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
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
