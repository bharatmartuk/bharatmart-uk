'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { guestOrderTrackSchema, type GuestOrderTrackInput } from '@bharatmart/validation'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@bharatmart/ui'
import { trackGuestOrderAction, type TrackOrderState } from '@/app/(shop)/orders/actions'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function TrackOrderClient() {
  const [result, setResult] = useState<TrackOrderState | null>(null)
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestOrderTrackInput>({
    resolver: zodResolver(guestOrderTrackSchema),
    defaultValues: { orderNumber: '', email: '' },
  })

  function onSubmit(values: GuestOrderTrackInput) {
    startTransition(async () => {
      const next = await trackGuestOrderAction(values)
      setResult(next)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Track your order</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="track-orderNumber">Order number</Label>
              <Input
                autoComplete="off"
                id="track-orderNumber"
                placeholder="BM-2026-123456"
                {...register('orderNumber')}
              />
              {errors.orderNumber ? (
                <p className="text-xs text-[#a83635]">{errors.orderNumber.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="track-email">Email used at checkout</Label>
              <Input autoComplete="email" id="track-email" type="email" {...register('email')} />
              {errors.email ? (
                <p className="text-xs text-[#a83635]">{errors.email.message}</p>
              ) : null}
            </div>
            <Button
              className="bg-[#7f5700] text-white hover:bg-[#604100]"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Looking up…' : 'Track order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && !result.ok ? (
        <p className="text-sm text-[#a83635]">{result.error}</p>
      ) : null}

      {result?.ok ? (
        <Card className="border-[#d6c4ad]">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>{result.order.orderNumber}</CardTitle>
              <p className="mt-1 text-sm text-[#514534]">
                Placed {dateFormatter.format(new Date(result.order.placedAt))} ·{' '}
                {priceFormatter.format(result.order.totalInPence / 100)}
              </p>
            </div>
            <Badge>{result.order.paymentStatus}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-[#514534]">
              Delivering to {result.order.address.line1}
              {result.order.address.line2 ? `, ${result.order.address.line2}` : ''},{' '}
              {result.order.address.city}
              {result.order.address.county ? `, ${result.order.address.county}` : ''}{' '}
              {result.order.address.postcode}
            </p>

            {result.order.merchantOrders.length === 0 ? (
              <p className="rounded-lg bg-[#f9f3ea] px-3 py-2 text-[#514534]">
                Payment is still pending — merchants will start preparing once payment is confirmed.
              </p>
            ) : (
              result.order.merchantOrders.map((mo) => (
                <div className="rounded-xl border border-[#d6c4ad] p-4" key={mo.id}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-semibold">{mo.storeName}</p>
                    <Badge>{mo.status}</Badge>
                  </div>
                  {mo.trackingNumber ? (
                    <p className="mb-2 text-[#514534]">
                      Tracking: {mo.trackingNumber}
                      {mo.courierName ? ` (${mo.courierName})` : ''}
                    </p>
                  ) : null}
                  <ul className="space-y-1">
                    {mo.items.map((item) => (
                      <li className="flex justify-between gap-3" key={`${mo.id}-${item.name}`}>
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          {priceFormatter.format((item.priceInPence * item.quantity) / 100)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}

            <p className="text-xs text-[#837561]">
              Want order history in one place?{' '}
              <Link className="font-medium text-[#7f5700] hover:underline" href="/register">
                Create an account
              </Link>{' '}
              with the same email to attach past guest orders.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
