import 'server-only'

import { Resend } from 'resend'
import type { ContactFormInput } from '@bharatmart/validation'

const SUBJECT_LABELS: Record<ContactFormInput['subject'], string> = {
  general: 'General Enquiry',
  order: 'Order Issue',
  merchant: 'Become a Merchant',
  other: 'Report a Problem',
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Sends a contact-form message to the support inbox via Resend.
 * MVP: email only — no database table.
 */
export async function sendContactFormEmail(data: ContactFormInput) {
  const inbox = process.env.SUPPORT_INBOX_EMAIL?.trim()
  if (!inbox) {
    throw new Error('SUPPORT_INBOX_EMAIL is not configured')
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const subjectLabel = SUBJECT_LABELS[data.subject]
  const resend = new Resend(apiKey)
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'BharatMart UK <onboarding@resend.dev>',
    to: inbox,
    replyTo: data.email,
    subject: `[Contact] ${subjectLabel} — ${data.name}`,
    html: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#fff8f0;padding:24px;color:#1e1b16">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d6c4ad;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;color:#7f5700;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:12px">Contact form</p>
    <h1 style="color:#7f5700;font-size:20px;margin:0 0 16px">${escapeHtml(subjectLabel)}</h1>
    <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
    <div style="margin:0;line-height:1.6;color:#514534;white-space:pre-wrap">${escapeHtml(data.message)}</div>
  </div>
  </body></html>`,
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  return { ok: true as const }
}
