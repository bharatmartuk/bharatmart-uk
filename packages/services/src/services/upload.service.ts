import 'server-only'

import { v2 as cloudinary } from 'cloudinary'

/**
 * Signed Cloudinary uploads:
 * - server generates signature (API secret never leaves the server)
 * - browser uploads directly to Cloudinary with that signature
 */
export type UploadFolder =
  | 'bharatmart/products'
  | 'bharatmart/merchant-documents'
  | 'bharatmart/merchant-logos'
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

export const UploadService = {
  async uploadImage(fileName: string, folder: UploadFolder): Promise<UploadResult> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase() || 'upload'
    const publicId = `${folder}/${Date.now()}-${safeName}`

    if (!configureCloudinary()) {
      const url = `https://picsum.photos/seed/${encodeURIComponent(publicId)}/800/800`
      return { url, publicId, folder }
    }

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
    return { url, publicId, folder }
  },

  async createSignedUpload(folder: UploadFolder) {
    const timestamp = Math.floor(Date.now() / 1000)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? 'stub'
    const apiKey = process.env.CLOUDINARY_API_KEY ?? 'stub'
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!apiSecret) {
      return {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature: 'pending-cloudinary-secret',
      }
    }

    // Cloudinary requires params sorted alphabetically before hashing.
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret,
    )

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
