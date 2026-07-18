'use server'

import { revalidatePath } from 'next/cache'
import { AddressService, NotFoundError, ValidationError } from '@bharatmart/services'
import { addressSchema, type AddressInput } from '@bharatmart/validation'
import { getCurrentUser } from '@/auth'

export type AddressActionState =
  | {
      ok: true
      address: {
        id: string
        label: string
        line1: string
        line2: string | null
        city: string
        postcode: string
        isDefault: boolean
      }
    }
  | { ok: true }
  | { ok: false; error: string }

function mapAddress(address: {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  postcode: string
  isDefault: boolean
}) {
  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    postcode: address.postcode,
    isDefault: address.isDefault,
  }
}

function revalidateAddressPaths() {
  revalidatePath('/account')
  revalidatePath('/checkout')
}

export async function createAddressAction(input: AddressInput): Promise<AddressActionState> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to save an address.' }

  const parsed = addressSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid address details.' }
  }

  try {
    const address = await AddressService.createForUser(user.id, parsed.data)
    revalidateAddressPaths()
    return { ok: true, address: mapAddress(address) }
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, error: error.message }
    return { ok: false, error: 'Unable to save address. Please try again.' }
  }
}

export async function updateAddressAction(
  addressId: string,
  input: AddressInput,
): Promise<AddressActionState> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to update an address.' }

  const parsed = addressSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid address details.' }
  }

  try {
    const address = await AddressService.updateForUser(addressId, user.id, parsed.data)
    revalidateAddressPaths()
    return { ok: true, address: mapAddress(address) }
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to update address. Please try again.' }
  }
}

export async function setDefaultAddressAction(addressId: string): Promise<AddressActionState> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to update an address.' }

  try {
    const address = await AddressService.setDefaultForUser(addressId, user.id)
    revalidateAddressPaths()
    return { ok: true, address: mapAddress(address) }
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message }
    return { ok: false, error: 'Unable to set default address.' }
  }
}

export async function deleteAddressAction(addressId: string): Promise<AddressActionState> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to delete an address.' }

  try {
    await AddressService.deleteForUser(addressId, user.id)
    revalidateAddressPaths()
    return { ok: true }
  } catch (error) {
    if (error instanceof NotFoundError) return { ok: false, error: error.message }
    return { ok: false, error: 'Unable to delete address. It may be used by an existing order.' }
  }
}
