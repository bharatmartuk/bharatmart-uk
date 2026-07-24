'use client'

import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'

type GuestCheckoutChooserProps = {
  onContinueAsGuest: () => void
}

export function GuestCheckoutChooser({ onContinueAsGuest }: GuestCheckoutChooserProps) {
  return (
    <Card className="mx-auto max-w-lg border-[#d6c4ad]">
      <CardHeader>
        <CardTitle>How would you like to checkout?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#514534]">
          Continue as a guest with your contact details, or sign in to use saved addresses and track
          orders in your account.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="bg-[#7f5700] text-white hover:bg-[#604100]"
            onClick={onContinueAsGuest}
            type="button"
          >
            Continue as guest
          </Button>
          <Button asChild className="border-[#d6c4ad]" variant="outline">
            <Link href="/login?callbackUrl=/checkout">Sign in</Link>
          </Button>
        </div>
        <p className="text-xs text-[#837561]">
          Already shopping often?{' '}
          <Link className="font-medium text-[#7f5700] hover:underline" href="/register?callbackUrl=/checkout">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
