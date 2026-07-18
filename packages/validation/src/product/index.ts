import { z } from 'zod'

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'])

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  priceInPence: z.number().int().positive(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(1),
  imageUrls: z.array(z.string().url()).min(1).max(8),
  status: productStatusSchema.optional(),
})

export type ProductInput = z.infer<typeof productSchema>
