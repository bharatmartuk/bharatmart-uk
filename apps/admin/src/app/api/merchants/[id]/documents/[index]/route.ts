import { NextResponse } from 'next/server'
import { MerchantService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const runtime = 'nodejs'

function parseDataUrl(dataUrl: string) {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i.exec(dataUrl)
  if (!match) return null
  return {
    contentType: match[1] || 'application/octet-stream',
    buffer: Buffer.from(match[2], 'base64'),
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; index: string }> },
) {
  const admin = await getCurrentUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, index: indexParam } = await context.params
  const index = Number.parseInt(indexParam, 10)
  if (!Number.isFinite(index) || index < 0) {
    return NextResponse.json({ error: 'Invalid document index' }, { status: 400 })
  }

  const merchant = await MerchantService.getById(id)
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const url = merchant.verificationDocumentUrls[index]
  if (!url) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (url.startsWith('data:')) {
    const parsed = parseDataUrl(url)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid document data' }, { status: 400 })
    }
    return new NextResponse(new Uint8Array(parsed.buffer), {
      headers: {
        'Content-Type': parsed.contentType,
        'Cache-Control': 'private, no-store',
        'Content-Disposition': 'inline',
      },
    })
  }

  // Same-origin relative uploads (or absolute merchant upload URLs).
  try {
    const target = new URL(url, request.url)
    if (target.pathname.startsWith('/api/uploads/files/')) {
      return NextResponse.redirect(target)
    }
  } catch {
    // fall through
  }

  return NextResponse.redirect(url)
}
