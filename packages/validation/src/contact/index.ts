import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email address'),
  subject: z.enum(['general', 'order', 'merchant', 'other'], {
    required_error: 'Please choose a subject',
  }),
  message: z.string().trim().min(10, 'Please enter at least 10 characters'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

export const CONTACT_SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'order', label: 'Order Issue' },
  { value: 'merchant', label: 'Become a Merchant' },
  { value: 'other', label: 'Report a Problem' },
] as const
