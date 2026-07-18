import { z } from 'zod'

const ukPostcode = z
  .string()
  .trim()
  .min(5, 'Enter a valid UK postcode')
  .max(10, 'Enter a valid UK postcode')

export const addressSchema = z.object({
  label: z.string().trim().min(2, 'Label is required').max(40),
  line1: z.string().trim().min(3, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  postcode: ukPostcode,
  country: z.string().min(2),
  isDefault: z.boolean(),
})

export type AddressInput = z.infer<typeof addressSchema>

export const checkoutSchema = z.object({
  address: addressSchema,
  notes: z.string().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
