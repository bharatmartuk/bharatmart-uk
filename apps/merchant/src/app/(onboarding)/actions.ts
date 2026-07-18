'use server'

import {
  MerchantService,
  ConflictError,
  ValidationError,
} from '@bharatmart/services'
import type { MerchantOnboardingInput } from '@bharatmart/validation'
import { getCurrentUser } from '@/auth'

export async function submitMerchantOnboarding(input: MerchantOnboardingInput) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Please sign in first.' }

  try {
    await MerchantService.submitForVerification(user.id, input)
  } catch (error) {
    if (error instanceof ConflictError || error instanceof ValidationError) {
      return { ok: false as const, error: error.message }
    }
    return { ok: false as const, error: 'Unable to submit onboarding.' }
  }

  // Client refreshes the JWT (CUSTOMER → MERCHANT) then navigates.
  return { ok: true as const }
}
