import { NextResponse } from 'next/server'
import {
  RateLimitError,
  UploadService,
  enforceRateLimit,
  RATE_LIMITS,
  type UploadFolder,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const runtime = 'nodejs'

/** Keep under Vercel's ~4.5MB serverless body limit. */
const MAX_BYTES = 4 * 1024 * 1024

const allowedFolders: UploadFolder[] = [
  'bharatmart/products',
  'bharatmart/merchant-documents',
]

/**
 * Authenticated server-side upload straight to Cloudinary.
 * Used for merchant legal docs, store photos, logos, and product images.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await enforceRateLimit(user.id, RATE_LIMITS.uploadLocal, 'upload more files')
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
      )
    }
    throw error
  }

  if (!UploadService.isConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary is not configured on this server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel → merchant project → Settings → Environment Variables, then redeploy.',
      },
      { status: 503 },
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = String(formData.get('folder') || '') as UploadFolder

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }
  if (!allowedFolders.includes(folder)) {
    return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
  }
  if (file.size <= 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File is too large (max 4MB). Compress the image or use a smaller PDF.' },
      { status: 400 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await UploadService.uploadBuffer(buffer, {
      folder,
      fileName: file.name,
      resourceType: 'auto',
    })
    return NextResponse.json({ url: uploaded.url, publicId: uploaded.publicId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloudinary upload failed'
    console.error('[uploads]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
