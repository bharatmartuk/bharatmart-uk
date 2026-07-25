'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  CheckCircle2,
  Info,
  Package,
  Receipt,
  Truck,
  XCircle,
} from 'lucide-react'
import { Button, Input, Label } from '@bharatmart/ui'
import { updateOrderStatusAction } from '@/app/(dashboard)/orders/actions'
import {
  COURIER_OPTIONS,
  NEXT_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  orderStatusHint,
  orderStatusLabel,
  type MerchantOrderStatus,
} from '@/lib/order-status'

const OTHER_COURIER = '__other__'

const FLOW: MerchantOrderStatus[] = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function StatusIcon({ status }: { status: MerchantOrderStatus }) {
  const className = 'h-5 w-5'
  switch (status) {
    case 'SHIPPED':
      return <Truck aria-hidden className={className} />
    case 'DELIVERED':
      return <CheckCircle2 aria-hidden className={className} />
    case 'CANCELLED':
      return <XCircle aria-hidden className={className} />
    case 'PROCESSING':
      return <Package aria-hidden className={className} />
    default:
      return <Info aria-hidden className={className} />
  }
}

function panelTone(status: MerchantOrderStatus) {
  switch (status) {
    case 'DELIVERED':
      return 'border-[#b7e0bd] bg-[#eefaef] text-[#0e4e21]'
    case 'CANCELLED':
      return 'border-[#f3c7c3] bg-[#fdeeed] text-[#93000a]'
    case 'SHIPPED':
      return 'border-[#bcd6f5] bg-[#eef4fd] text-[#1e4b8f]'
    default:
      return 'border-[#ecd9b6] bg-[#fdf5e6] text-[#5b3d00]'
  }
}

function flowStepState(
  step: MerchantOrderStatus,
  current: MerchantOrderStatus,
): 'done' | 'current' | 'upcoming' {
  if (current === 'CANCELLED') return step === 'PLACED' ? 'done' : 'upcoming'
  const currentIndex = FLOW.indexOf(current)
  const stepIndex = FLOW.indexOf(step)
  if (stepIndex < currentIndex) return 'done'
  if (stepIndex === currentIndex) return 'current'
  return 'upcoming'
}

export function OrderStatusForm({
  merchantOrderId,
  currentStatus,
  initialTrackingNumber = '',
  initialCourierName = '',
}: {
  merchantOrderId: string
  currentStatus: string
  initialTrackingNumber?: string
  initialCourierName?: string
}) {
  const router = useRouter()
  const options = NEXT_ORDER_STATUSES[currentStatus as MerchantOrderStatus] ?? []
  const [status, setStatus] = useState(options[0] ?? currentStatus)
  // Keep the selection valid after the order advances and the page revalidates.
  const selected = options.includes(status as MerchantOrderStatus)
    ? (status as MerchantOrderStatus)
    : (options[0] ?? (currentStatus as MerchantOrderStatus))

  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber)
  const presetCourier = COURIER_OPTIONS.includes(
    initialCourierName as (typeof COURIER_OPTIONS)[number],
  )
  const [courierChoice, setCourierChoice] = useState(
    initialCourierName ? (presetCourier ? initialCourierName : OTHER_COURIER) : '',
  )
  const [customCourier, setCustomCourier] = useState(presetCourier ? '' : initialCourierName)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const courierName = courierChoice === OTHER_COURIER ? customCourier : courierChoice
  const closed = options.length === 0
  const current = currentStatus as MerchantOrderStatus

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrderStatusAction(merchantOrderId, selected, {
        ...(trackingNumber.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
        ...(courierName.trim() ? { courierName: courierName.trim() } : {}),
      })
      setMessage(
        result.ok
          ? { ok: true, text: 'Status updated successfully.' }
          : { ok: false, text: result.error },
      )
      if (result.ok) router.refresh()
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="rounded-xl border border-[#ecd9b6] bg-[#fdfaf6] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#837561]">
            Status flow
          </p>
          <ol className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {FLOW.map((step, index) => {
              const state = flowStepState(step, current)
              return (
                <li className="flex items-center gap-2" key={step}>
                  {index > 0 ? <span className="text-[#d6c4ad]">→</span> : null}
                  <span
                    className={
                      state === 'done'
                        ? 'rounded-full bg-[#e8f5eb] px-2.5 py-1 font-medium text-[#2e6a39]'
                        : state === 'current'
                          ? 'rounded-full bg-[#7f5700] px-2.5 py-1 font-medium text-white'
                          : 'rounded-full bg-[#eee7de] px-2.5 py-1 text-[#837561]'
                    }
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-xs text-[#514534]">
            Statuses unlock one step at a time. From{' '}
            <strong>{orderStatusLabel(currentStatus)}</strong> you can move to{' '}
            {options.length > 0
              ? options.map((option) => orderStatusLabel(option)).join(' or ')
              : 'no further statuses'}
            .
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-status">Next status</Label>
          {closed ? (
            <p className="rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] px-4 py-3 text-sm text-[#514534]">
              This order is {orderStatusLabel(currentStatus).toLowerCase()} and can no longer be
              updated.
            </p>
          ) : (
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5700]">
                <StatusIcon status={selected} />
              </span>
              <select
                aria-label="Order status"
                className="h-11 w-full appearance-none rounded-xl border border-[#d6c4ad] bg-white pl-10 pr-8 text-sm font-medium outline-none transition focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
                id="order-status"
                onChange={(event) => setStatus(event.target.value as MerchantOrderStatus)}
                value={selected}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {orderStatusLabel(option)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#837561]">
                ▾
              </span>
            </div>
          )}
          <p className="text-xs text-[#837561]">
            Current status: {orderStatusLabel(currentStatus)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tracking-number">Tracking number (optional)</Label>
            <Input
              className="h-11 border-[#d6c4ad] bg-white"
              disabled={closed}
              id="tracking-number"
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Enter tracking number"
              value={trackingNumber}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courier">Courier (optional)</Label>
            <select
              aria-label="Courier"
              className="h-11 w-full rounded-xl border border-[#d6c4ad] bg-white px-3 text-sm outline-none transition focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20 disabled:opacity-60"
              disabled={closed}
              id="courier"
              onChange={(event) => setCourierChoice(event.target.value)}
              value={courierChoice}
            >
              <option value="">Select courier</option>
              {COURIER_OPTIONS.map((courier) => (
                <option key={courier} value={courier}>
                  {courier}
                </option>
              ))}
              <option value={OTHER_COURIER}>Other…</option>
            </select>
            {courierChoice === OTHER_COURIER ? (
              <Input
                aria-label="Courier name"
                className="mt-2 h-11 border-[#d6c4ad] bg-white"
                disabled={closed}
                onChange={(event) => setCustomCourier(event.target.value)}
                placeholder="Courier name"
                value={customCourier}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            className="bg-[#7f5700] text-white shadow-sm transition hover:bg-[#604100]"
            disabled={pending || closed}
            onClick={handleSave}
            type="button"
          >
            {pending ? 'Saving…' : 'Save status'}
          </Button>
          <Button
            className="border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
            disabled
            title="Coming soon"
            type="button"
            variant="outline"
          >
            <Receipt className="mr-2 h-4 w-4" aria-hidden />
            Generate invoice
          </Button>
        </div>

        {message ? (
          <p className={`text-sm ${message.ok ? 'text-[#2e6a39]' : 'text-[#a83635]'}`}>
            {message.text}
          </p>
        ) : null}
      </div>

      <aside
        className={`flex flex-col gap-2 rounded-2xl border p-4 ${panelTone(selected)}`}
        aria-live="polite"
      >
        <div className="flex items-center gap-2 font-semibold">
          <StatusIcon status={selected} />
          {orderStatusLabel(selected)}
        </div>
        <p className="text-sm opacity-90">
          {closed
            ? 'No further status changes are available for this order.'
            : orderStatusHint(selected)}
        </p>
      </aside>
    </div>
  )
}
