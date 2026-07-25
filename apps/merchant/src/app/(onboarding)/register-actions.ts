'use server'

import {
  AuthService,
  ConflictError,
  ValidationError,
} from '@bharatmart/services'
import {
  resendVerificationSchema,
  type RegisterInput,
} from '@bharatmart/validation'

export type RegisterActionState =
  | { ok: true; email: string; emailSent: boolean }
  | { ok: false; error: string }

export async function registerSellerAccountAction(
  input: RegisterInput,
): Promise<RegisterActionState> {
  try {
    const user = await AuthService.registerCustomer(input, {
      verificationAudience: 'seller',
    })
    return {
      ok: true,
      email: user.email ?? input.email,
      emailSent: true,
    }
  } catch (error) {
    if (error instanceof ConflictError || error instanceof ValidationError) {
      return { ok: false, error: error.message }
    }
    if (
      error instanceof Error &&
      /RESEND_API_KEY|Failed to send email|not configured|Unable to send/i.test(error.message)
    ) {
      return { ok: true, email: input.email, emailSent: false }
    }
    return { ok: false, error: 'Unable to create your seller account.' }
  }
}

export type ResendVerificationActionState = { ok: true } | { ok: false; error: string }

export async function resendSellerVerificationAction(
  email: string,
): Promise<ResendVerificationActionState> {
  const parsed = resendVerificationSchema.safeParse({ email })
  if (!parsed.success) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  try {
    await AuthService.resendVerificationEmail(parsed.data.email, { audience: 'seller' })
    return { ok: true }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to resend the verification email. Try again shortly.' }
  }
}
