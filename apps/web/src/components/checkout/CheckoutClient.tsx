'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreditCard, Banknote, Eye, WalletCards } from 'lucide-react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  toast,
} from '@bharatmart/ui'
import { useCartStore, type CartItem } from '@/lib/store/cart-store'
import {
  placeGuestOrder,
  placeOrder,
  type CheckoutPaymentMethod,
} from '@/app/(shop)/checkout/actions'
import { AddressForm } from '@/components/account/AddressForm'
import { GuestCheckoutChooser } from '@/components/checkout/GuestCheckoutChooser'
import {
  GuestDetailsForm,
  type GuestDetailsFormValues,
} from '@/components/checkout/GuestDetailsForm'

type AddressOption = {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  postcode: string
  isDefault: boolean
}

type PreparedCheckout = {
  orderId: string
  orderNumber: string
  clientSecret: string | null
  paymentIntentId: string | null
  paymentMethod: CheckoutPaymentMethod
  totalInPence: number
  finalized: boolean
  isGuest: boolean
}

const steps = ['Address', 'Payment', 'Review'] as const

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

const paymentOptions: Array<{
  id: CheckoutPaymentMethod
  title: string
  description: string
  icon: typeof CreditCard
}> = [
  {
    id: 'CARD',
    title: 'Debit / Credit card',
    description: 'Visa, Mastercard, Amex - including Apple Pay & Google Pay when available.',
    icon: CreditCard,
  },
  {
    id: 'CASH_ON_DELIVERY',
    title: 'Cash on delivery',
    description: 'Pay the courier in cash when your order arrives.',
    icon: Banknote,
  },
]

function OrderLines({ items }: { items: CartItem[] }) {
  const [previewItem, setPreviewItem] = useState<CartItem | null>(null)

  return (
    <>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            className="flex items-center gap-3 rounded-xl border border-[#d6c4ad] bg-white p-3"
            key={item.productId}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f9f3ea]">
              {item.imageUrl ? (
                <Image
                  alt={item.name}
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={item.imageUrl}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-[#837561]">
                  No image
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[#1e1b16]">{item.name}</p>
              <p className="mt-0.5 text-xs text-[#837561]">
                Sold by {item.merchantName} · Qty {item.quantity}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#a83635]">
                {priceFormatter.format((item.priceInPence * item.quantity) / 100)}
              </p>
            </div>
            <Button
              className="shrink-0 border-[#d6c4ad] text-[#7f5700]"
              onClick={() => setPreviewItem(item)}
              size="sm"
              type="button"
              variant="outline"
            >
              <Eye className="mr-1.5 h-4 w-4" />
              Preview
            </Button>
          </li>
        ))}
      </ul>

      <Dialog
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null)
        }}
        open={Boolean(previewItem)}
      >
        <DialogContent className="max-w-md border-[#d6c4ad] bg-[#fff8f0]">
          {previewItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{previewItem.name}</DialogTitle>
                <DialogDescription>
                  Sold by {previewItem.merchantName} · Qty {previewItem.quantity}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f9f3ea]">
                {previewItem.imageUrl ? (
                  <Image
                    alt={previewItem.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 448px) 100vw, 448px"
                    src={previewItem.imageUrl}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#837561]">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-[#a83635]">
                  {priceFormatter.format(
                    (previewItem.priceInPence * previewItem.quantity) / 100,
                  )}
                </p>
                <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
                  <Link href={`/products/${previewItem.slug}`} target="_blank">
                    View product
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function StripePayButton({
  orderId,
  orderNumber,
  isGuest,
  isPending,
  onError,
  onSuccess,
}: {
  orderId: string
  orderNumber: string
  isGuest: boolean
  isPending: boolean
  onError: (message: string) => void
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [confirming, setConfirming] = useState(false)

  async function confirmPayment() {
    if (!stripe || !elements) {
      onError('Stripe has not finished loading.')
      return
    }

    const returnUrl = isGuest
      ? `${window.location.origin}/orders/confirmation/${encodeURIComponent(orderNumber)}?placed=1`
      : `${window.location.origin}/account/orders/${orderId}?placed=1`

    setConfirming(true)
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    })
    setConfirming(false)

    if (result.error) {
      onError(result.error.message ?? 'Payment failed. Please try another card.')
      return
    }

    onSuccess()
  }

  return (
    <Button
      className="bg-[#2e6a39] text-white hover:bg-[#135224]"
      disabled={isPending || confirming || !stripe || !elements}
      onClick={() => void confirmPayment()}
      type="button"
    >
      {confirming || isPending ? 'Processing…' : 'Pay with card'}
    </Button>
  )
}

export function CheckoutClient({
  addresses,
  isAuthenticated,
}: {
  addresses: AddressOption[]
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const [guestMode, setGuestMode] = useState(false)
  const [guestDetails, setGuestDetails] = useState<GuestDetailsFormValues | null>(null)
  const [step, setStep] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState(addresses)
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '',
  )
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('CARD')
  const [error, setError] = useState<string | null>(null)
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null)
  const [isPending, startTransition] = useTransition()

  const subtotalInPence = useMemo(
    () => items.reduce((total, item) => total + item.priceInPence * item.quantity, 0),
    [items],
  )

  const isGuestCheckout = !isAuthenticated && guestMode

  if (!isAuthenticated && !guestMode) {
    if (items.length === 0) {
      return (
        <Card className="mx-auto max-w-lg border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return <GuestCheckoutChooser onContinueAsGuest={() => setGuestMode(true)} />
  }

  if (items.length === 0 && !prepared) {
    return (
      <Card className="mx-auto max-w-lg border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Your cart is empty</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  function completeCheckout(order: PreparedCheckout) {
    clearCart()
    toast.success('Order placed successfully', {
      description: order.isGuest
        ? 'Save your order number to track delivery.'
        : 'You can track it anytime from My orders.',
    })
    if (order.isGuest) {
      router.push(`/orders/confirmation/${encodeURIComponent(order.orderNumber)}?placed=1`)
      return
    }
    router.push(`/account/orders/${order.orderId}?placed=1`)
  }

  function createAuthOrder(
    method: CheckoutPaymentMethod,
    onSuccess: (order: PreparedCheckout) => void,
  ) {
    setError(null)
    startTransition(async () => {
      const result = await placeOrder(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        addressId,
        method,
      )

      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      const next: PreparedCheckout = {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        paymentMethod: result.paymentMethod,
        totalInPence: result.totalInPence,
        finalized: result.finalized,
        isGuest: false,
      }
      setPrepared(next)
      onSuccess(next)
    })
  }

  function createGuestOrder(
    method: CheckoutPaymentMethod,
    details: GuestDetailsFormValues,
    onSuccess: (order: PreparedCheckout) => void,
  ) {
    setError(null)
    startTransition(async () => {
      const result = await placeGuestOrder({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone,
        line1: details.line1,
        ...(details.line2?.trim() ? { line2: details.line2.trim() } : {}),
        city: details.city,
        county: details.county,
        postcode: details.postcode,
        country: details.country || 'GB',
        paymentMethod: method,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })

      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      const next: PreparedCheckout = {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        paymentMethod: result.paymentMethod,
        totalInPence: result.totalInPence,
        finalized: result.finalized,
        isGuest: true,
      }
      setPrepared(next)
      onSuccess(next)
    })
  }

  function continueFromPayment() {
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      setPrepared(null)
      setStep(2)
      return
    }

    if (isGuestCheckout) {
      if (!guestDetails) {
        setError('Enter your delivery details first.')
        setStep(0)
        return
      }
      createGuestOrder('CARD', guestDetails, () => setStep(2))
      return
    }

    createAuthOrder('CARD', () => setStep(2))
  }

  function placeCodOrder() {
    if (isGuestCheckout) {
      if (!guestDetails) {
        setError('Enter your delivery details first.')
        setStep(0)
        return
      }
      createGuestOrder('CASH_ON_DELIVERY', guestDetails, (order) => completeCheckout(order))
      return
    }
    createAuthOrder('CASH_ON_DELIVERY', (order) => completeCheckout(order))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <ol className="flex flex-wrap gap-3">
          {steps.map((label, index) => (
            <li
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                index === step
                  ? 'bg-[#7f5700] text-white'
                  : index < step
                    ? 'bg-[#e8a317]/30 text-[#5b3d00]'
                    : 'bg-[#eee7de] text-[#837561]'
              }`}
              key={label}
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <Card className="border-[#d6c4ad]">
            <CardHeader>
              <CardTitle>
                {isGuestCheckout ? 'Your details & delivery' : 'Delivery address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isGuestCheckout ? (
                <>
                  <GuestDetailsForm
                    {...(guestDetails ? { defaultValues: guestDetails } : {})}
                    onSubmit={(values) => {
                      setGuestDetails(values)
                      setPrepared(null)
                      setStep(1)
                    }}
                    submitLabel="Continue to payment"
                  />
                  <button
                    className="text-sm font-medium text-[#7f5700] hover:underline"
                    onClick={() => {
                      setGuestMode(false)
                      setGuestDetails(null)
                      setStep(0)
                    }}
                    type="button"
                  >
                    Prefer to sign in instead?
                  </button>
                </>
              ) : (
                <>
                  {savedAddresses.length === 0 ? (
                    <p className="text-sm text-[#514534]">
                      No saved addresses yet. Add a delivery address below to continue.
                    </p>
                  ) : (
                    savedAddresses.map((address) => (
                      <div
                        className={`rounded-xl border p-4 ${
                          addressId === address.id
                            ? 'border-[#7f5700] bg-[#f9f3ea]'
                            : 'border-[#d6c4ad]'
                        }`}
                        key={address.id}
                      >
                        {editingAddressId === address.id ? (
                          <div>
                            <h3 className="mb-4 font-semibold">Edit address</h3>
                            <AddressForm
                              addressId={address.id}
                              initialValues={{
                                label: address.label,
                                line1: address.line1,
                                line2: address.line2 ?? '',
                                city: address.city,
                                postcode: address.postcode,
                                country: 'GB',
                                isDefault: address.isDefault,
                              }}
                              mode="edit"
                              onCancel={() => setEditingAddressId(null)}
                              onUpdated={(updated) => {
                                setSavedAddresses((current) =>
                                  current.map((item) => {
                                    if (item.id === updated.id) return updated
                                    if (updated.isDefault) {
                                      return { ...item, isDefault: false }
                                    }
                                    return item
                                  }),
                                )
                                setAddressId(updated.id)
                                setPrepared(null)
                                setEditingAddressId(null)
                                router.refresh()
                              }}
                              submitLabel="Save changes"
                            />
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <label className="min-w-0 flex-1 cursor-pointer">
                              <input
                                checked={addressId === address.id}
                                className="mr-3"
                                name="address"
                                onChange={() => {
                                  setAddressId(address.id)
                                  setPrepared(null)
                                }}
                                type="radio"
                              />
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault ? (
                                <span className="ml-2 text-xs font-medium text-[#7f5700]">
                                  Default
                                </span>
                              ) : null}
                              <p className="mt-1 text-sm text-[#514534]">
                                {address.line1}
                                {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                                {address.postcode}
                              </p>
                            </label>
                            <Button
                              className="shrink-0 border-[#d6c4ad] text-[#7f5700]"
                              onClick={() => {
                                setEditingAddressId(address.id)
                                setAddressId(address.id)
                                setShowAddressForm(false)
                                setPrepared(null)
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {showAddressForm && !editingAddressId ? (
                    <div className="rounded-xl border border-dashed border-[#d6c4ad] bg-white p-4">
                      <h3 className="mb-4 font-semibold">Add a delivery address</h3>
                      <AddressForm
                        onCancel={
                          savedAddresses.length > 0
                            ? () => setShowAddressForm(false)
                            : undefined
                        }
                        onCreated={(address) => {
                          setSavedAddresses((current) => {
                            const next = address.isDefault
                              ? current.map((item) => ({ ...item, isDefault: false }))
                              : current
                            return [...next, address]
                          })
                          setAddressId(address.id)
                          setPrepared(null)
                          setShowAddressForm(false)
                          router.refresh()
                        }}
                        submitLabel="Save & use this address"
                      />
                    </div>
                  ) : null}

                  <div
                    className={`mt-2 flex flex-col gap-3 border-t border-[#eee7de] pt-4 sm:mt-1 sm:flex-row sm:items-center ${
                      showAddressForm || editingAddressId
                        ? 'sm:justify-end'
                        : 'sm:justify-between'
                    }`}
                  >
                    {!showAddressForm && !editingAddressId ? (
                      <Button
                        className="w-full border-[#d6c4ad] sm:w-auto"
                        onClick={() => {
                          setShowAddressForm(true)
                          setEditingAddressId(null)
                        }}
                        type="button"
                        variant="outline"
                      >
                        Add another address
                      </Button>
                    ) : null}
                    <Button
                      className="w-full bg-[#7f5700] text-white hover:bg-[#604100] sm:w-auto sm:min-w-[220px]"
                      disabled={!addressId || Boolean(editingAddressId)}
                      onClick={() => setStep(1)}
                      type="button"
                    >
                      Continue to payment
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="border-[#d6c4ad]">
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

              <div className="space-y-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  const selected = paymentMethod === option.id
                  return (
                    <label
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                        selected ? 'border-[#7f5700] bg-[#f9f3ea]' : 'border-[#d6c4ad] bg-white'
                      }`}
                      key={option.id}
                    >
                      <input
                        checked={selected}
                        className="mt-1"
                        name="paymentMethod"
                        onChange={() => {
                          setPaymentMethod(option.id)
                          setPrepared(null)
                          setError(null)
                        }}
                        type="radio"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold text-[#1e1b16]">
                          <Icon className="h-4 w-4 text-[#7f5700]" />
                          {option.title}
                        </div>
                        <p className="mt-1 text-sm text-[#514534]">{option.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {paymentMethod === 'CARD' ? (
                <div className="rounded-lg bg-[#f9f3ea] p-3 text-sm text-[#514534]">
                  <p className="flex items-center gap-2 font-medium text-[#5b3d00]">
                    <WalletCards className="h-4 w-4" />
                    Card payment (UK)
                  </p>
                  <p className="mt-1">
                    Pay securely by debit or credit card. When Stripe is configured, Apple Pay and
                    Google Pay also appear automatically for supported devices.
                    {!publishableKey
                      ? ' Stripe keys are not set yet - you can still review the flow, or choose Cash on delivery.'
                      : null}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-[#f9f3ea] p-3 text-sm text-[#514534]">
                  Have the exact cash amount ready for the delivery partner. Your order is confirmed
                  immediately and merchants start preparing it.
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setStep(0)} type="button" variant="outline">
                  Back
                </Button>
                <Button
                  className="bg-[#7f5700] text-white hover:bg-[#604100]"
                  disabled={isPending}
                  onClick={continueFromPayment}
                  type="button"
                >
                  {isPending ? 'Preparing…' : 'Review order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="border-[#d6c4ad]">
            <CardHeader>
              <CardTitle>Review & place order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-[#f9f3ea] px-3 py-2 text-sm text-[#514534]">
                Payment:{' '}
                <strong>
                  {paymentMethod === 'CARD' ? 'Debit / Credit card' : 'Cash on delivery'}
                </strong>
                {prepared ? (
                  <>
                    {' '}
                    · Order <strong>{prepared.orderNumber}</strong>
                  </>
                ) : null}
              </div>

              {isGuestCheckout && guestDetails ? (
                <div className="rounded-lg border border-[#d6c4ad] px-3 py-2 text-sm text-[#514534]">
                  <p className="font-medium text-[#1e1b16]">
                    {guestDetails.firstName} {guestDetails.lastName}
                  </p>
                  <p>
                    {guestDetails.line1}
                    {guestDetails.line2 ? `, ${guestDetails.line2}` : ''}, {guestDetails.city},{' '}
                    {guestDetails.county}, {guestDetails.postcode}
                  </p>
                  <p>
                    {guestDetails.email} · {guestDetails.phone}
                  </p>
                </div>
              ) : null}

              <OrderLines items={items} />
              {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setStep(1)
                    setPrepared(null)
                  }}
                  type="button"
                  variant="outline"
                >
                  Back
                </Button>

                {paymentMethod === 'CASH_ON_DELIVERY' ? (
                  <Button
                    className="bg-[#2e6a39] text-white hover:bg-[#135224]"
                    disabled={isPending}
                    onClick={placeCodOrder}
                    type="button"
                  >
                    {isPending ? 'Placing order…' : 'Place COD order'}
                  </Button>
                ) : prepared?.clientSecret && stripePromise ? (
                  <Elements
                    options={{
                      clientSecret: prepared.clientSecret,
                      appearance: { theme: 'stripe' },
                    }}
                    stripe={stripePromise}
                  >
                    <div className="w-full space-y-4">
                      <PaymentElement />
                      <StripePayButton
                        isGuest={prepared.isGuest}
                        isPending={isPending}
                        onError={(message) => {
                          setError(message)
                          toast.error(message)
                        }}
                        onSuccess={() => completeCheckout(prepared)}
                        orderId={prepared.orderId}
                        orderNumber={prepared.orderNumber}
                      />
                    </div>
                  </Elements>
                ) : (
                  <Button
                    className="bg-[#2e6a39] text-white hover:bg-[#135224]"
                    disabled={isPending || !prepared}
                    onClick={() => {
                      if (!prepared) return
                      completeCheckout(prepared)
                    }}
                    type="button"
                  >
                    {isPending
                      ? 'Processing…'
                      : prepared
                        ? 'Place order (card pending / no Stripe keys)'
                        : 'Preparing card payment…'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <aside>
        <Card className="sticky top-24 border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.reduce((n, item) => n + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-[#a83635]">
                {priceFormatter.format((prepared?.totalInPence ?? subtotalInPence) / 100)}
              </span>
            </div>
            <p className="pt-2 text-xs text-[#837561]">
              {paymentMethod === 'CARD'
                ? 'Card charged securely at confirmation.'
                : 'Cash collected on delivery.'}
            </p>
            {isGuestCheckout ? (
              <p className="text-xs text-[#837561]">
                Track later with your order number and email at{' '}
                <Link className="font-medium text-[#7f5700] hover:underline" href="/orders/track">
                  /orders/track
                </Link>
                .
              </p>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
