import { z } from 'zod'

/** Max products accepted in one CSV / bulk import job. */
export const PRODUCT_BULK_MAX_ROWS = 100

const bulkStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'])

export const bulkProductRowSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().min(10),
  /** Category slug from the marketplace catalogue */
  categorySlug: z.string().min(1),
  /** Price in pounds (e.g. 14.99) — converted to pence on import */
  pricePounds: z.number().positive(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(1),
  imageUrl: z.string().url(),
  status: bulkStatusSchema.optional(),
})

export const productBulkSchema = z
  .array(bulkProductRowSchema)
  .min(1, 'Add at least one product row.')
  .max(PRODUCT_BULK_MAX_ROWS, `You can import at most ${PRODUCT_BULK_MAX_ROWS} products at once.`)

export type BulkProductRowInput = z.infer<typeof bulkProductRowSchema>
export type ProductBulkInput = z.infer<typeof productBulkSchema>
