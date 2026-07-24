'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Separator, toast } from '@bharatmart/ui'
import { useCartStore } from '@/lib/store/cart-store'
import { validateCoupon } from '@/app/(shop)/cart/actions'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function CartClient() {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const [couponCode, setCouponCode] = useState('')
  const [discountInPence, setDiscountInPence] = useState(0)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { merchantId: string; merchantName: string; items: typeof items; subtotalInPence: number }
    >()

    for (const item of items) {
      const existing = map.get(item.merchantId)
      if (!existing) {
        map.set(item.merchantId, {
          merchantId: item.merchantId,
          merchantName: item.merchantName,
          items: [item],
          subtotalInPence: item.priceInPence * item.quantity,
        })
      } else {
        existing.items.push(item)
        existing.subtotalInPence += item.priceInPence * item.quantity
      }
    }

    return [...map.values()]
  }, [items])

  const subtotalInPence = groups.reduce((total, group) => total + group.subtotalInPence, 0)
  const grandTotalInPence = Math.max(subtotalInPence - discountInPence, 0)

  function applyCoupon() {
    startTransition(async () => {
      const result = await validateCoupon(couponCode, subtotalInPence)
      if (!result.ok) {
        setDiscountInPence(0)
        setCouponMessage(result.error)
        toast.error(result.error)
        return
      }
      setDiscountInPence(result.discountInPence)
      const message = `Applied ${result.code}: −${priceFormatter.format(result.discountInPence / 100)}`
      setCouponMessage(message)
      toast.success(message)
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center py-12 text-center">
        <h1 className="font-heading text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-[#514534]">
          Browse trending products and add favourites to get started.
        </p>
        <Button asChild className="mt-6 bg-[#7f5700] text-white hover:bg-[#604100]">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Shopping cart</h1>
      <p className="mt-1 text-sm text-[#514534]">
        Items are grouped by merchant for multi-seller checkout.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          {groups.map((group) => (
            <Card className="border-[#d6c4ad]" key={group.merchantId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.merchantName}</CardTitle>
                <p className="text-sm text-[#837561]">
                  Subtotal {priceFormatter.format(group.subtotalInPence / 100)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => (
                  <div
                    className="flex gap-4 border-t border-[#eee7de] pt-4 first:border-0 first:pt-0"
                    key={item.productId}
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f9f3ea]">
                      {item.imageUrl ? (
                        <Image
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="96px"
                          src={item.imageUrl}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-semibold hover:text-[#7f5700]"
                        href={`/products/${item.slug}`}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 font-bold text-[#a83635]">
                        {priceFormatter.format(item.priceInPence / 100)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-[#d6c4ad]">
                          <button
                            aria-label="Decrease quantity"
                            className="p-2"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeItem(item.productId)
                                toast.success(`Removed “${item.name}” from cart`)
                                return
                              }
                              updateQuantity(item.productId, item.quantity - 1)
                            }}
                            type="button"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="p-2"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          aria-label={`Remove ${item.name}`}
                          className="inline-flex items-center gap-1 text-sm text-[#a83635]"
                          onClick={() => {
                            removeItem(item.productId)
                            toast.success(`Removed “${item.name}” from cart`)
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <aside>
          <Card className="sticky top-24 border-[#d6c4ad]">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  value={couponCode}
                />
                <Button disabled={isPending} onClick={applyCoupon} type="button" variant="outline">
                  Apply
                </Button>
              </div>
              {couponMessage ? (
                <p className={`text-sm ${discountInPence > 0 ? 'text-[#2e6a39]' : 'text-[#a83635]'}`}>
                  {couponMessage}
                </p>
              ) : (
                <p className="text-xs text-[#837561]">
                  Tip: seed a Coupon row to test validation end to end.
                </p>
              )}

              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{priceFormatter.format(subtotalInPence / 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>−{priceFormatter.format(discountInPence / 100)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#a83635]">
                  {priceFormatter.format(grandTotalInPence / 100)}
                </span>
              </div>
              <Button asChild className="w-full bg-[#2e6a39] text-white hover:bg-[#135224]">
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
