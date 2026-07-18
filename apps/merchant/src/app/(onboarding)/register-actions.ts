'use server'

import { AuthService, ConflictError, ValidationError } from '@bharatmart/services'
import type { RegisterInput } from '@bharatmart/validation'

export type RegisterActionState = { ok: true } | { ok: false; error: string }

export async function registerSellerAccountAction(
  input: RegisterInput,
): Promise<RegisterActionState> {
  try {
    await AuthService.registerCustomer(input)
    return { ok: true }
  } catch (error) {
    if (error instanceof ConflictError || error instanceof ValidationError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to create your seller account.' }
  }
}
