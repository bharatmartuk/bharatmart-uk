'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreditCard, Banknote, WalletCards } from 'lucide-react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { useCartStore } from '@/lib/store/cart-store'
import { placeOrder, type CheckoutPaymentMethod } from '@/app/(shop)/checkout/actions'
import { AddressForm } from '@/components/account/AddressForm'

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
}

type CartLine = {
  productId: string
  name: string
  quantity: number
  priceInPence: number
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
    description: 'Visa, Mastercard, Amex — including Apple Pay & Google Pay when available.',
    icon: CreditCard,
  },
  {
    id: 'CASH_ON_DELIVERY',
    title: 'Cash on delivery',
    description: 'Pay the courier in cash when your order arrives.',
    icon: Banknote,
  },
]

function OrderLines({ items }: { items: CartLine[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li className="flex justify-between gap-3" key={item.productId}>
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>{priceFormatter.format((item.priceInPence * item.quantity) / 100)}</span>
        </li>
      ))}
    </ul>
  )
}

function StripePayButton({
  orderId,
  isPending,
  onError,
  onSuccess,
}: {
  orderId: string
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

    setConfirming(true)
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/orders/${orderId}?placed=1`,
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
  const [step, setStep] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState(addresses)
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '',
  )
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0)
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('CARD')
  const [error, setError] = useState<string | null>(null)
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null)
  const [isPending, startTransition] = useTransition()

  const subtotalInPence = useMemo(
    () => items.reduce((total, item) => total + item.priceInPence * item.quantity, 0),
    [items],
  )

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-lg border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Sign in to checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#514534]">
            Checkout needs a saved delivery address from your customer account.
          </p>
          <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
            <Link href="/login?callbackUrl=/checkout">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
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

  function completeCheckout(orderId: string) {
    clearCart()
    router.push(`/account/orders/${orderId}?placed=1`)
  }

  function createOrder(method: CheckoutPaymentMethod, onSuccess: (order: PreparedCheckout) => void) {
    setError(null)
    startTransition(async () => {
      const result = await placeOrder(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        addressId,
        method,
      )

      if (!result.ok) {
        setError(result.error)
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

    // Card: create PaymentIntent now so Elements can render on Review.
    createOrder('CARD', () => setStep(2))
  }

  function placeCodOrder() {
    createOrder('CASH_ON_DELIVERY', (order) => completeCheckout(order.orderId))
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
              <CardTitle>Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedAddresses.length === 0 ? (
                <p className="text-sm text-[#514534]">
                  No saved addresses yet. Add a delivery address below to continue.
                </p>
              ) : (
                savedAddresses.map((address) => (
                  <label
                    className={`block cursor-pointer rounded-xl border p-4 ${
                      addressId === address.id ? 'border-[#7f5700] bg-[#f9f3ea]' : 'border-[#d6c4ad]'
                    }`}
                    key={address.id}
                  >
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
                    <p className="mt-1 text-sm text-[#514534]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                      {address.postcode}
                    </p>
                  </label>
                ))
              )}

              {showAddressForm ? (
                <div className="rounded-xl border border-dashed border-[#d6c4ad] bg-white p-4">
                  <h3 className="mb-4 font-semibold">Add a delivery address</h3>
                  <AddressForm
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
                  showAddressForm ? 'sm:justify-end' : 'sm:justify-between'
                }`}
              >
                {!showAddressForm ? (
                  <Button
                    className="w-full border-[#d6c4ad] sm:w-auto"
                    onClick={() => setShowAddressForm(true)}
                    type="button"
                    variant="outline"
                  >
                    Add another address
                  </Button>
                ) : null}
                <Button
                  className="w-full bg-[#7f5700] text-white hover:bg-[#604100] sm:w-auto sm:min-w-[220px]"
                  disabled={!addressId}
                  onClick={() => setStep(1)}
                  type="button"
                >
                  Continue to payment
                </Button>
              </div>
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
                      ? ' Stripe keys are not set yet — you can still review the flow, or choose Cash on delivery.'
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
                        isPending={isPending}
                        onError={setError}
                        onSuccess={() => completeCheckout(prepared.orderId)}
                        orderId={prepared.orderId}
                      />
                    </div>
                  </Elements>
                ) : (
                  <Button
                    className="bg-[#2e6a39] text-white hover:bg-[#135224]"
                    disabled={isPending || !prepared}
                    onClick={() => {
                      if (!prepared) return
                      // Dev fallback without Stripe keys — order stays PENDING.
                      completeCheckout(prepared.orderId)
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
                {priceFormatter.format(
                  (prepared?.totalInPence ?? subtotalInPence) / 100,
                )}
              </span>
            </div>
            <p className="pt-2 text-xs text-[#837561]">
              {paymentMethod === 'CARD'
                ? 'Card charged securely at confirmation.'
                : 'Cash collected on delivery.'}
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
