import { z } from 'zod'

const ukPostcode = z
  .string()
  .trim()
  .min(5, 'Enter a valid UK postcode')
  .max(10, 'Enter a valid UK postcode')

const ukPhone = z
  .string()
  .trim()
  .min(10, 'Enter a valid UK phone number')
  .max(20, 'Enter a valid UK phone number')
  .regex(/^[+0-9()\s-]+$/, 'Enter a valid UK phone number')

export const addressSchema = z.object({
  label: z.string().trim().min(2, 'Label is required').max(40),
  line1: z.string().trim().min(3, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  county: z.string().trim().max(60).optional(),
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

export const guestCheckoutContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: z.string().trim().email('Enter a valid email address').max(120),
  phone: ukPhone,
})

export type GuestCheckoutContactInput = z.infer<typeof guestCheckoutContactSchema>

export const guestCheckoutAddressSchema = z.object({
  line1: z.string().trim().min(3, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  county: z.string().trim().min(2, 'County is required').max(60),
  postcode: ukPostcode,
  country: z.string().min(2),
})

export type GuestCheckoutAddressInput = z.infer<typeof guestCheckoutAddressSchema>

export const guestCheckoutSchema = z.object({
  contact: guestCheckoutContactSchema,
  address: guestCheckoutAddressSchema,
  paymentMethod: z.enum(['CARD', 'CASH_ON_DELIVERY']).default('CARD'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'Cart is empty.'),
})

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>

export const guestOrderTrackSchema = z.object({
  orderNumber: z.string().trim().min(5, 'Enter your order number'),
  email: z.string().trim().email('Enter the email used at checkout'),
})

export type GuestOrderTrackInput = z.infer<typeof guestOrderTrackSchema>
