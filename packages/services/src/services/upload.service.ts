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
  isConfigured() {
    return configureCloudinary()
  },

  async uploadImage(fileName: string, folder: UploadFolder): Promise<UploadResult> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase() || 'upload'
    const publicId = `${folder}/${Date.now()}-${safeName}`

    if (!configureCloudinary()) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
    return { url, publicId, folder }
  },

  /** Server-side upload from a buffer (seed scripts, migrations). */
  async uploadBuffer(
    buffer: Buffer,
    options: { folder: UploadFolder; publicId: string },
  ): Promise<UploadResult> {
    if (!configureCloudinary()) {
      throw new Error('Cloudinary is not configured.')
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: options.publicId,
          overwrite: true,
          resource_type: 'image',
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
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

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
