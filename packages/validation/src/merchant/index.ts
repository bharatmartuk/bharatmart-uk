import { z } from 'zod'

export const businessTypeSchema = z.enum([
  'GROCERY',
  'RESTAURANT',
  'SWEETS_SNACKS',
  'CLOTHING',
  'JEWELLERY',
  'TEMPLE_STORE',
  'AYURVEDIC_WELLNESS',
  'DISTRIBUTOR',
  'OTHER',
])

export const merchantOnboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: businessTypeSchema,
  registrationNumber: z.string().min(2).optional(),
  contactPhone: z.string().min(7, 'Phone number is required'),
  registeredAddress: z.string().min(8, 'Registered address is required'),
  storeName: z.string().min(2, 'Store name is required'),
  storeSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  storeDescription: z.string().min(20, 'Tell shoppers a bit about your store'),
  deliveryPostcodes: z.array(z.string().min(2)).min(1, 'Add at least one delivery postcode'),
  businessDocumentUrl: z.string().url('Upload a business document'),
  idProofUrl: z.string().url('Upload an ID proof document'),
})

export type MerchantOnboardingInput = z.infer<typeof merchantOnboardingSchema>

export const merchantStoreProfileSchema = z.object({
  storeName: z.string().min(2),
  storeDescription: z.string().min(10),
  storeLogoUrl: z.string().url().optional().or(z.literal('')),
  storeBannerUrl: z.string().url().optional().or(z.literal('')),
})

export const merchantDeliveryAreasSchema = z.object({
  deliveryPostcodes: z.array(z.string().min(2)).min(1),
})

export const merchantPayoutDetailsSchema = z.object({
  accountHolderName: z.string().min(2),
  sortCode: z.string().min(6),
  accountNumber: z.string().min(6),
})

export const merchantNotificationSettingsSchema = z.object({
  emailOrders: z.boolean(),
  emailStock: z.boolean(),
  emailMarketing: z.boolean(),
})
