'use server'

import { revalidatePath } from 'next/cache'
import {
  clearCustomerLocation,
  persistCustomerPostcode,
  persistLocationSkipped,
} from '@/lib/customer-location'

export async function saveDeliveryPostcodeAction(raw: string) {
  const result = await persistCustomerPostcode(raw)
  if (result.ok) {
    revalidatePath('/', 'layout')
  }
  return result
}

export async function skipDeliveryPostcodeAction() {
  await persistLocationSkipped()
  revalidatePath('/', 'layout')
  return { ok: true as const }
}

export async function clearDeliveryPostcodeAction() {
  await clearCustomerLocation()
  revalidatePath('/', 'layout')
  return { ok: true as const }
}
