'use server'

import { headers } from 'next/headers'
import {
  AuthService,
  ConflictError,
  RateLimitError,
  ValidationError,
  clientIpFromHeaders,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import type { RegisterInput } from '@bharatmart/validation'

export type RegisterActionState =
  | { ok: true }
  | { ok: false; error: string }

export async function registerCustomerAction(input: RegisterInput): Promise<RegisterActionState> {
  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    await enforceRateLimit(ip, RATE_LIMITS.register, 'create another account')
    await AuthService.registerCustomer(input)
    return { ok: true }
  } catch (error) {
    if (
      error instanceof ConflictError ||
      error instanceof ValidationError ||
      error instanceof RateLimitError
    ) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to create your account.' }
  }
}
