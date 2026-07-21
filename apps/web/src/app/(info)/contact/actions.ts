'use server'

import { contactFormSchema, type ContactFormInput } from '@bharatmart/validation'
import { sendContactFormEmail } from '@bharatmart/services'

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitContactForm(data: ContactFormInput): Promise<SubmitContactResult> {
  const parsed = contactFormSchema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Invalid form data' }
  }

  try {
    await sendContactFormEmail(parsed.data)
    return { ok: true }
  } catch (error) {
    console.error('[submitContactForm]', error)
    return {
      ok: false,
      error: 'We could not send your message right now. Please try WhatsApp or email instead.',
    }
  }
}
