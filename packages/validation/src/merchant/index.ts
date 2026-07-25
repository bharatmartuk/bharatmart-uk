import { z } from 'zod'

const documentUrlSchema = z
  .string()
  .min(1, 'Document is required')
  .refine(
    (value) => value.startsWith('data:') || value.startsWith('https://') || value.startsWith('http://'),
    'Upload a valid document',
  )

const optionalDocumentUrlSchema = z.union([z.literal(''), documentUrlSchema]).optional()

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

/** Business types that sell food and therefore require a food hygiene / license document. */
export const FOOD_BUSINESS_TYPES = [
  'GROCERY',
  'RESTAURANT',
  'SWEETS_SNACKS',
] as const satisfies ReadonlyArray<z.infer<typeof businessTypeSchema>>

export function isFoodBusinessType(type: z.infer<typeof businessTypeSchema>) {
  return (FOOD_BUSINESS_TYPES as readonly string[]).includes(type)
}

export const merchantOnboardingSchema = z
  .object({
    businessName: z.string().min(2, 'Company / business name is required'),
    businessType: businessTypeSchema,
    registrationNumber: z.string().min(2, 'Company number is required'),
    contactPhone: z.string().min(7, 'Contact number is required'),
    registeredAddress: z.string().min(8, 'Registered office address is required'),
    storeName: z.string().min(2, 'Store name is required'),
    storeSlug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
    storeDescription: z.string().min(20, 'Tell shoppers a bit about your store (20+ characters)'),
    storeLogoUrl: documentUrlSchema,
    deliveryPostcodes: z.array(z.string().min(2)).min(1, 'Add at least one delivery postcode'),
    businessDocumentUrl: documentUrlSchema,
    /** Owner identity document (passport / driving licence / national ID). */
    idProofUrl: documentUrlSchema,
    hasPhysicalStore: z.boolean(),
    physicalStorePhotoUrl: optionalDocumentUrlSchema,
    foodLicenseUrl: optionalDocumentUrlSchema,
  })
  .superRefine((data, ctx) => {
    if (data.hasPhysicalStore && !data.physicalStorePhotoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['physicalStorePhotoUrl'],
        message: 'Upload a photo of your physical store',
      })
    }
    if (isFoodBusinessType(data.businessType) && !data.foodLicenseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['foodLicenseUrl'],
        message: 'Food licence / hygiene certificate is required for food businesses',
      })
    }
  })

export type MerchantOnboardingInput = z.infer<typeof merchantOnboardingSchema>

export const merchantVerificationDocumentsSchema = z
  .object({
    businessDocumentUrl: documentUrlSchema,
    idProofUrl: documentUrlSchema,
    hasPhysicalStore: z.boolean(),
    physicalStorePhotoUrl: optionalDocumentUrlSchema,
    foodLicenseUrl: optionalDocumentUrlSchema,
    businessType: businessTypeSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasPhysicalStore && !data.physicalStorePhotoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['physicalStorePhotoUrl'],
        message: 'Upload a photo of your physical store',
      })
    }
    if (data.businessType && isFoodBusinessType(data.businessType) && !data.foodLicenseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['foodLicenseUrl'],
        message: 'Food licence / hygiene certificate is required for food businesses',
      })
    }
  })

export type MerchantVerificationDocumentsInput = z.infer<typeof merchantVerificationDocumentsSchema>

export const merchantStoreProfileSchema = z.object({
  storeName: z.string().min(2),
  storeDescription: z.string().min(10),
  storeLogoUrl: z.string().url().optional().or(z.literal('')),
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
