import { NextResponse } from 'next/server'
import { MerchantService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const runtime = 'nodejs'

function parseDataUrl(dataUrl: string) {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i.exec(dataUrl)
  const base64 = match?.[2]
  if (!base64) return null
  return {
    contentType: match[1] || 'application/octet-stream',
    buffer: Buffer.from(base64, 'base64'),
  }
}

function guessContentType(url: string) {
  if (/\.pdf($|\?|#)/i.test(url) || url.includes('/raw/upload/')) return 'application/pdf'
  if (/\.png($|\?|#)/i.test(url)) return 'image/png'
  if (/\.jpe?g($|\?|#)/i.test(url)) return 'image/jpeg'
  if (/\.webp($|\?|#)/i.test(url)) return 'image/webp'
  if (/\.gif($|\?|#)/i.test(url)) return 'image/gif'
  if (/\.avif($|\?|#)/i.test(url)) return 'image/avif'
  return 'application/octet-stream'
}

function documentUrlsForMerchant(merchant: {
  verificationDocumentUrls: string[]
  hasPhysicalStore: boolean
  physicalStorePhotoUrl: string | null
  foodLicenseUrl: string | null
}) {
  return [
    merchant.verificationDocumentUrls[0],
    merchant.verificationDocumentUrls[1],
    merchant.hasPhysicalStore ? merchant.physicalStorePhotoUrl : null,
    merchant.foodLicenseUrl,
  ].filter((value): value is string => Boolean(value))
}

async function proxyRemoteDocument(url: string, requestUrl: string) {
  try {
    const target = new URL(url, requestUrl)
    if (target.pathname.startsWith('/api/uploads/files/')) {
      const response = await fetch(target, {
        headers: { Accept: '*/*' },
        redirect: 'follow',
      })
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to load document' }, { status: 502 })
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      const contentType =
        response.headers.get('content-type')?.split(';')[0]?.trim() || guessContentType(url)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, no-store',
          'Content-Disposition': 'inline',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }
  } catch {
    // fall through to absolute remote fetch
  }

  const response = await fetch(url, {
    headers: { Accept: '*/*' },
    redirect: 'follow',
  })
  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to load document from storage' },
      { status: 502 },
    )
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType =
    response.headers.get('content-type')?.split(';')[0]?.trim() || guessContentType(url)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  })
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

  const urls = documentUrlsForMerchant(merchant)
  const url = urls[index]
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
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  try {
    return await proxyRemoteDocument(url, request.url)
  } catch {
    return NextResponse.json({ error: 'Failed to load document' }, { status: 502 })
  }
}
