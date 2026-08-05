import { NextResponse } from 'next/server'
import {
  RateLimitError,
  UploadService,
  enforceRateLimit,
  RATE_LIMITS,
  type UploadFolder,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

const allowedFolders: UploadFolder[] = [
  'bharatmart/products',
  'bharatmart/merchant-documents',
  'bharatmart/carousel',
  'bharatmart/banners',
]

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await enforceRateLimit(user.id, RATE_LIMITS.uploadSign, 'upload more files')
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
      )
    }
    throw error
  }

  const body = (await request.json()) as { folder?: string }
  const folder = body.folder as UploadFolder | undefined
  if (!folder || !allowedFolders.includes(folder)) {
    return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
  }

  try {
    const signed = await UploadService.createSignedUpload(folder)
    return NextResponse.json(signed)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Cloudinary is not configured on this server.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
