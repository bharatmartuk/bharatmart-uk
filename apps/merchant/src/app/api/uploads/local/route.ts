import { NextResponse } from 'next/server'
import {
  RateLimitError,
  UploadService,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const runtime = 'nodejs'

const MAX_BYTES = 4 * 1024 * 1024

/**
 * Legacy local upload endpoint - now stores on Cloudinary (Vercel has no persistent disk).
 * Kept so older clients calling `/api/uploads/local` still work.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await enforceRateLimit(user.id, RATE_LIMITS.uploadLocal, 'upload more documents')
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
          'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel for the merchant app, then redeploy.',
      },
      { status: 503 },
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is too large (max 4MB)' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await UploadService.uploadBuffer(buffer, {
      folder: 'bharatmart/merchant-documents',
      fileName: file.name,
      resourceType: UploadService.resourceTypeForFile({
        fileName: file.name,
        mimeType: file.type,
      }),
    })
    return NextResponse.json({ url: uploaded.url, publicId: uploaded.publicId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
