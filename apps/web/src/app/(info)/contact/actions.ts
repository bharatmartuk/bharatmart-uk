'use server'

import { headers } from 'next/headers'
import {
  RateLimitError,
  clientIpFromHeaders,
  enforceRateLimit,
  RATE_LIMITS,
  sendContactFormEmail,
} from '@bharatmart/services'
import { contactFormSchema, type ContactFormInput } from '@bharatmart/validation'

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitContactForm(data: ContactFormInput): Promise<SubmitContactResult> {
  const parsed = contactFormSchema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid form data' }
  }

  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    await enforceRateLimit(ip, RATE_LIMITS.contact, 'send another message')
    await sendContactFormEmail(parsed.data)
    return { ok: true }
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    console.error('[submitContactForm]', error)
    return {
      ok: false,
      error: 'We could not send your message right now. Please try WhatsApp or email instead.',
    }
  }
}
