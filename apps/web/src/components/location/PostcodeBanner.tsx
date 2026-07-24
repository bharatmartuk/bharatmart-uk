'use client'

import { useState, useTransition } from 'react'
import { MapPin } from 'lucide-react'
import { Button, Input, toast } from '@bharatmart/ui'
import {
  saveDeliveryPostcodeAction,
  skipDeliveryPostcodeAction,
} from '@/app/(shop)/location-actions'
import type { CustomerLocation } from '@/lib/customer-location-types'

export function PostcodeBanner({ location }: { location: CustomerLocation }) {
  const [editing, setEditing] = useState(false)
  const [postcode, setPostcode] = useState(location.postcode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (location.status === 'set') return null

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await saveDeliveryPostcodeAction(postcode)
      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setEditing(false)
      toast.success(`Delivery area set to ${result.postcode}`)
    })
  }

  return (
    <div className="border-b border-[#e8d9c8] bg-[#f9f3ea]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8 lg:px-16">
        <div className="flex items-start gap-2 text-sm text-[#514534]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7f5700]" />
          <p>
            <span className="font-medium text-[#1e1b16]">
              Enter your postcode to see delivery availability
            </span>
            {' '}
            and merchants that serve your area. You can still browse the full marketplace.
          </p>
        </div>

        {editing ? (
          <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
            <Input
              className="uppercase sm:max-w-[11rem]"
              disabled={pending}
              onChange={(event) => setPostcode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  save()
                }
              }}
              placeholder="E14 8PX"
              value={postcode}
            />
            <div className="flex gap-2">
              <Button
                className="bg-[#a83635] text-white hover:bg-[#8f2e2d]"
                disabled={pending}
                onClick={save}
                size="sm"
                type="button"
              >
                Save
              </Button>
              <Button
                disabled={pending}
                onClick={() => {
                  setEditing(false)
                  setError(null)
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
            {error ? <p className="text-xs text-[#a83635] sm:col-span-2">{error}</p> : null}
          </div>
        ) : (
          <div className="flex shrink-0 gap-2">
            <Button
              className="bg-[#a83635] text-white hover:bg-[#8f2e2d]"
              onClick={() => setEditing(true)}
              size="sm"
              type="button"
            >
              Enter postcode
            </Button>
            {location.status === 'unknown' ? (
              <Button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await skipDeliveryPostcodeAction()
                    toast.message('Browsing all areas', {
                      description: 'Add a postcode anytime to filter merchants near you.',
                    })
                  })
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                Not now
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
