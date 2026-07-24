'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MapPin, Pencil } from 'lucide-react'
import { Button, Input, toast } from '@bharatmart/ui'
import {
  clearDeliveryPostcodeAction,
  saveDeliveryPostcodeAction,
} from '@/app/(shop)/location-actions'
import type { CustomerLocation } from '@/lib/customer-location-types'

export function LocationChip({ location }: { location: CustomerLocation }) {
  const [editing, setEditing] = useState(false)
  const [postcode, setPostcode] = useState(location.postcode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Logged-in: postcode lives on the saved address - send them to Account
  if (location.source === 'account') {
    return (
      <Link
        className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#514534] transition hover:bg-[#f4ede4] hover:text-[#7f5700] lg:flex"
        href="/account"
        title="Manage delivery address"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7f5700]" />
        <span className="max-w-[7rem] truncate">
          {location.postcode ? location.postcode : 'Add address'}
        </span>
        <Pencil className="h-3 w-3 opacity-60" />
      </Link>
    )
  }

  if (editing) {
    return (
      <div className="hidden flex-col items-start gap-1 lg:flex">
        <div className="flex items-center gap-1">
          <Input
            className="h-8 w-[7.5rem] text-xs uppercase"
            disabled={pending}
            onChange={(event) => setPostcode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
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
            }}
            placeholder="Postcode"
            value={postcode}
          />
          <Button
            className="h-8 px-2 text-xs"
            disabled={pending}
            onClick={() => {
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
            }}
            size="sm"
            type="button"
          >
            Go
          </Button>
          {location.status === 'set' ? (
            <Button
              className="h-8 px-2 text-xs"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await clearDeliveryPostcodeAction()
                  setEditing(false)
                  setPostcode('')
                  toast.message('Delivery postcode cleared', {
                    description: 'Showing products from all areas.',
                  })
                })
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
          ) : (
            <Button
              className="h-8 px-2 text-xs"
              disabled={pending}
              onClick={() => {
                setEditing(false)
                setError(null)
                setPostcode(location.postcode ?? '')
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          )}
        </div>
        {error ? <p className="text-[10px] text-[#a83635]">{error}</p> : null}
      </div>
    )
  }

  return (
    <button
      className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#514534] transition hover:bg-[#f4ede4] hover:text-[#7f5700] lg:flex"
      onClick={() => setEditing(true)}
      type="button"
    >
      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7f5700]" />
      <span className="max-w-[7rem] truncate">
        {location.status === 'set' && location.postcode
          ? location.postcode
          : 'Set delivery area'}
      </span>
      <Pencil className="h-3 w-3 opacity-60" />
    </button>
  )
}
