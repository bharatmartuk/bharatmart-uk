'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Star, Trash2 } from 'lucide-react'
import { Button, toast } from '@bharatmart/ui'
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/app/(shop)/account/actions'
import { AddressForm, type AddressRecord } from '@/components/account/AddressForm'

export function AddressBook({ addresses }: { addresses: AddressRecord[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(addresses.length === 0)
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
    <div className="space-y-6">
      {addresses.length === 0 ? (
        <p className="text-sm text-[#514534]">
          No saved addresses yet. Add one below to use it at checkout.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div className="rounded-lg bg-[#f9f3ea] p-4 text-sm" key={address.id}>
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
                        <p className="font-semibold">{address.label}</p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-[#2e6a39] px-2 py-0.5 text-xs text-white">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[#514534]">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                        {address.postcode}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
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
        </div>
      )}

      {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}

      {showCreateForm ? (
        <div className="rounded-xl border border-dashed border-[#d6c4ad] bg-white p-4">
          <h3 className="mb-4 font-semibold text-[#1e1b16]">Add a delivery address</h3>
          <AddressForm
            onCancel={addresses.length > 0 ? () => setShowCreateForm(false) : undefined}
            onCreated={() => {
              setShowCreateForm(false)
              refresh()
            }}
          />
        </div>
      ) : (
        <Button
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          onClick={() => {
            setEditingId(null)
            setShowCreateForm(true)
          }}
          type="button"
        >
          Add a delivery address
        </Button>
      )}
    </div>
  )
}
