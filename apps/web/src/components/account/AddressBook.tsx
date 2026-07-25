'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { Button, toast } from '@bharatmart/ui'
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/app/(shop)/account/actions'
import { AddressForm, type AddressRecord } from '@/components/account/AddressForm'
import { cn } from '@bharatmart/utils'

export function AddressBook({ addresses }: { addresses: AddressRecord[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function refresh() {
    router.refresh()
  }

  function onSetDefault(addressId: string) {
    setError(null)
    startTransition(async () => {
      const result = await setDefaultAddressAction(addressId)
      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setEditingId(null)
      toast.success('Default delivery address updated')
      refresh()
    })
  }

  function onDelete(addressId: string) {
    const confirmed = window.confirm('Delete this delivery address?')
    if (!confirmed) return

    setError(null)
    startTransition(async () => {
      const result = await deleteAddressAction(addressId)
      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      if (editingId === addressId) setEditingId(null)
      toast.success('Delivery address deleted')
      refresh()
    })
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showCreateForm ? (
        <div className="rounded-2xl border border-dashed border-[#e8d9c8] bg-[#f9f3ea]/60 px-6 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#7f5700] shadow-sm">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-3 text-sm text-[#514534]">
            No saved addresses yet. Add one for faster checkout.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {addresses.map((address) => (
          <div
            className={cn(
              'rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-5 shadow-sm',
              'transition-all duration-200 hover:shadow-md',
            )}
            key={address.id}
          >
            {editingId === address.id ? (
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
                onCancel={() => setEditingId(null)}
                onUpdated={() => {
                  setEditingId(null)
                  refresh()
                }}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-[#1e1b16]">{address.label}</p>
                      {address.isDefault ? (
                        <span className="rounded-full bg-[#2e6a39] px-2 py-0.5 text-xs text-white">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#514534]">
                      {address.line1}
                      {address.line2 ? (
                        <>
                          <br />
                          {address.line2}
                        </>
                      ) : null}
                      <br />
                      {address.city}
                      <br />
                      {address.postcode}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    aria-label={`Edit ${address.label}`}
                    disabled={isPending}
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingId(address.id)
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  {!address.isDefault ? (
                    <Button
                      aria-label={`Make ${address.label} default`}
                      disabled={isPending}
                      onClick={() => onSetDefault(address.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Star className="mr-1.5 h-3.5 w-3.5" />
                      Make default
                    </Button>
                  ) : null}
                  <Button
                    aria-label={`Delete ${address.label}`}
                    className="text-[#a83635] hover:bg-[#ffdad6] hover:text-[#93000a]"
                    disabled={isPending}
                    onClick={() => onDelete(address.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {!showCreateForm ? (
          <button
            aria-label="Add new delivery address"
            className={cn(
              'flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#d6c4ad] bg-white p-5 text-center',
              'transition-all duration-200 hover:border-[#7f5700] hover:bg-[#f9f3ea] hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5700]/40',
            )}
            onClick={() => {
              setEditingId(null)
              setShowCreateForm(true)
            }}
            type="button"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9f3ea] text-[#7f5700]">
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-[#1e1b16]">Add New Address</span>
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

      {showCreateForm ? (
        <div className="rounded-2xl border border-dashed border-[#d6c4ad] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#1e1b16]">Add a delivery address</h3>
          <AddressForm
            onCancel={() => setShowCreateForm(false)}
            onCreated={() => {
              setShowCreateForm(false)
              refresh()
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
