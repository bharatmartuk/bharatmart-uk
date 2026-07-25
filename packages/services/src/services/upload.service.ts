import 'server-only'

import { v2 as cloudinary } from 'cloudinary'

/**
 * Signed Cloudinary uploads:
 * - server generates signature (API secret never leaves the server)
 * - browser uploads directly to Cloudinary with that signature
 *
 * Also supports server-side buffer uploads (merchant docs, product images).
 */
export type UploadFolder =
  | 'bharatmart/products'
  | 'bharatmart/merchant-documents'
  | 'bharatmart/banners'

export interface UploadResult {
  url: string
  publicId: string
  folder: UploadFolder
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return false

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
  return true
}

function missingCloudinaryError() {
  return new Error(
    'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on this Vercel project.',
  )
}

export const UploadService = {
  isConfigured() {
    return configureCloudinary()
  },

  /**
   * Parse a Cloudinary delivery URL into public_id / resource_type / format.
   * Used by admin document proxy when public PDF delivery is blocked (401).
   */
  parseCloudinaryUrl(url: string): {
    cloudName: string
    resourceType: 'image' | 'raw' | 'video'
    publicId: string
    format: string | null
    version: string | null
  } | null {
    try {
      const parsed = new URL(url)
      if (!parsed.hostname.includes('res.cloudinary.com')) return null

      const parts = parsed.pathname.split('/').filter(Boolean)
      // [cloudName, resourceType, 'upload', ...rest]
      if (parts.length < 4) return null
      const [cloudName, resourceType, uploadToken, ...rest] = parts
      if (!cloudName || uploadToken !== 'upload') return null
      if (resourceType !== 'image' && resourceType !== 'raw' && resourceType !== 'video') {
        return null
      }

      let version: string | null = null
      let pathParts = rest
      if (pathParts[0] && /^v\d+$/i.test(pathParts[0])) {
        version = pathParts[0].slice(1)
        pathParts = pathParts.slice(1)
      }

      // Skip common transformation segments (e.g. s--sig--, w_100,c_fill)
      while (
        pathParts[0] &&
        (/^s--.+--$/i.test(pathParts[0]) ||
          /[_=,]/.test(pathParts[0]) ||
          pathParts[0].includes(','))
      ) {
        pathParts = pathParts.slice(1)
      }

      if (pathParts.length === 0) return null
      const filePath = decodeURIComponent(pathParts.join('/'))
      const extensionMatch = filePath.match(/\.([a-z0-9]+)$/i)
      const format = extensionMatch?.[1]?.toLowerCase() ?? null
      const publicId = format ? filePath.replace(/\.[a-z0-9]+$/i, '') : filePath

      return {
        cloudName,
        resourceType,
        publicId,
        format,
        version,
      }
    } catch {
      return null
    }
  },

  /**
   * Fetch a stored upload for admin review.
   * PDFs on many Cloudinary accounts return 401 on public URLs — use authenticated download.
   * `preview: true` returns the first page as JPEG for PDF overview cards.
   */
  async fetchStoredFile(
    url: string,
    options?: { preview?: boolean },
  ): Promise<{ buffer: Buffer; contentType: string }> {
    if (!configureCloudinary()) {
      throw missingCloudinaryError()
    }

    const cloudinaryMeta = this.parseCloudinaryUrl(url)
    const wantsPreview = Boolean(options?.preview)
    const isPdf =
      cloudinaryMeta?.format === 'pdf' ||
      /\.pdf($|\?|#)/i.test(url) ||
      url.includes('/raw/upload/')

    if (cloudinaryMeta && wantsPreview && isPdf) {
      const previewUrl = cloudinary.url(cloudinaryMeta.publicId, {
        resource_type: cloudinaryMeta.resourceType,
        type: 'upload',
        format: 'jpg',
        page: 1,
        secure: true,
        sign_url: true,
        ...(cloudinaryMeta.version
          ? { version: Number(cloudinaryMeta.version) }
          : {}),
      })
      const response = await fetch(previewUrl, { redirect: 'follow' })
      if (!response.ok) {
        throw new Error(`Failed to generate document preview (${response.status})`)
      }
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg',
      }
    }

    if (cloudinaryMeta && isPdf) {
      const downloadUrl = cloudinary.utils.private_download_url(
        cloudinaryMeta.publicId,
        cloudinaryMeta.format || 'pdf',
        {
          resource_type: cloudinaryMeta.resourceType,
          type: 'upload',
          expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
        },
      )
      const response = await fetch(downloadUrl, { redirect: 'follow' })
      if (!response.ok) {
        throw new Error(`Failed to download document (${response.status})`)
      }
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType:
          response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/pdf',
      }
    }

    const response = await fetch(url, {
      headers: { Accept: '*/*' },
      redirect: 'follow',
    })
    if (!response.ok) {
      // Last resort for restricted Cloudinary assets: authenticated download without assuming PDF.
      if (cloudinaryMeta) {
        const downloadUrl = cloudinary.utils.private_download_url(
          cloudinaryMeta.publicId,
          cloudinaryMeta.format || 'bin',
          {
            resource_type: cloudinaryMeta.resourceType,
            type: 'upload',
            expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
          },
        )
        const fallback = await fetch(downloadUrl, { redirect: 'follow' })
        if (!fallback.ok) {
          throw new Error(`Failed to load document from storage (${response.status})`)
        }
        return {
          buffer: Buffer.from(await fallback.arrayBuffer()),
          contentType:
            fallback.headers.get('content-type')?.split(';')[0]?.trim() ||
            'application/octet-stream',
        }
      }
      throw new Error(`Failed to load document from storage (${response.status})`)
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType:
        response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream',
    }
  },

  async uploadImage(fileName: string, folder: UploadFolder): Promise<UploadResult> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase() || 'upload'
    const publicId = `${folder}/${Date.now()}-${safeName}`

    if (!configureCloudinary()) {
      throw missingCloudinaryError()
    }

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
    return { url, publicId, folder }
  },

  /**
   * Server-side upload for merchant docs (PDF/images), product photos, logos, banners.
   * Uses resource_type auto so PDFs and images both land in Cloudinary.
   */
  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder: UploadFolder
      publicId?: string
      fileName?: string
      resourceType?: 'image' | 'auto' | 'raw'
    },
  ): Promise<UploadResult> {
    if (!configureCloudinary()) {
      throw missingCloudinaryError()
    }

    const safeName =
      (options.fileName || 'upload')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/\.[^.]+$/, '')
        .toLowerCase() || 'upload'

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          // When publicId is provided use it as-is; otherwise let Cloudinary nest under folder.
          ...(options.publicId
            ? { public_id: options.publicId }
            : { folder: options.folder, public_id: `${Date.now()}-${safeName}` }),
          overwrite: true,
          resource_type: options.resourceType ?? 'auto',
        },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error ?? new Error('Cloudinary upload failed'))
          else resolve({ secure_url: uploadResult.secure_url, public_id: uploadResult.public_id })
        },
      )
      stream.end(buffer)
    })

    return { url: result.secure_url, publicId: result.public_id, folder: options.folder }
  },

  async createSignedUpload(folder: UploadFolder) {
    const timestamp = Math.floor(Date.now() / 1000)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw missingCloudinaryError()
    }

    configureCloudinary()
    const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret)

    return {
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    }
  },
}

export const uploadService = UploadService
