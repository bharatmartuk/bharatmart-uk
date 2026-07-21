'use server'

import {
  MerchantService,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@bharatmart/services'
import {
  merchantVerificationDocumentsSchema,
  type MerchantOnboardingInput,
  type MerchantVerificationDocumentsInput,
} from '@bharatmart/validation'
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

export async function replaceVerificationDocuments(input: MerchantVerificationDocumentsInput) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Please sign in first.' }

  const parsed = merchantVerificationDocumentsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Please complete all required verification uploads.' }
  }

  try {
    await MerchantService.updateVerificationDocuments(user.id, {
      businessDocumentUrl: parsed.data.businessDocumentUrl,
      idProofUrl: parsed.data.idProofUrl,
      hasPhysicalStore: parsed.data.hasPhysicalStore,
      ...(parsed.data.physicalStorePhotoUrl
        ? { physicalStorePhotoUrl: parsed.data.physicalStorePhotoUrl }
        : {}),
      ...(parsed.data.foodLicenseUrl ? { foodLicenseUrl: parsed.data.foodLicenseUrl } : {}),
    })
  } catch (error) {
    if (
      error instanceof ConflictError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return { ok: false as const, error: error.message }
    }
    return { ok: false as const, error: 'Unable to update documents.' }
  }

  return { ok: true as const }
}
