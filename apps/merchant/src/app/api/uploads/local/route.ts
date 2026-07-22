import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { RateLimitError, enforceRateLimit, RATE_LIMITS } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024

function uploadsRoot() {
  return path.join(process.cwd(), '..', '..', 'uploads', 'merchant-documents')
}

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

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is too large (max 8MB)' }, { status: 400 })
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-') || 'document'
  const fileName = `${Date.now()}-${safeName}`
  const directory = uploadsRoot()
  await mkdir(directory, { recursive: true })
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(directory, fileName), bytes)

  const origin = new URL(request.url).origin
  return NextResponse.json({
    url: `${origin}/api/uploads/files/${encodeURIComponent(fileName)}`,
    publicId: `bharatmart/merchant-documents/${fileName}`,
  })
}
