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
import {
  resendVerificationSchema,
  verifyEmailSchema,
  type RegisterInput,
} from '@bharatmart/validation'

export type RegisterActionState =
  | { ok: true; needsVerification: true; email: string }
  | { ok: false; error: string }

export async function registerCustomerAction(input: RegisterInput): Promise<RegisterActionState> {
  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    await enforceRateLimit(ip, RATE_LIMITS.register, 'create another account')
    const user = await AuthService.registerCustomer(input)
    return {
      ok: true,
      needsVerification: true,
      email: user.email ?? input.email,
    }
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

export type VerifyEmailActionState =
  | { ok: true; email: string; alreadyVerified: boolean }
  | { ok: false; error: string }

export async function verifyEmailAction(token: string): Promise<VerifyEmailActionState> {
  const parsed = verifyEmailSchema.safeParse({ token })
  if (!parsed.success) {
    return { ok: false, error: 'Verification link is missing or incomplete.' }
  }

  try {
    const result = await AuthService.verifyEmail(parsed.data.token)
    return { ok: true, email: result.email, alreadyVerified: result.alreadyVerified }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to verify that email. Please request a new link.' }
  }
}

export type ResendVerificationActionState =
  | { ok: true }
  | { ok: false; error: string }

export async function resendVerificationAction(
  email: string,
): Promise<ResendVerificationActionState> {
  const parsed = resendVerificationSchema.safeParse({ email })
  if (!parsed.success) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    const key = `${ip}:${parsed.data.email.toLowerCase()}`
    await enforceRateLimit(key, RATE_LIMITS.emailVerify, 'request another verification email')
    await AuthService.resendVerificationEmail(parsed.data.email)
    // Always succeed outwardly so we do not reveal whether the email exists.
    return { ok: true }
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof ValidationError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to send a verification email right now.' }
  }
}
