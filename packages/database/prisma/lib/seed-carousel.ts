import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

/** Dedicated Cloudinary folder for homepage carousel slides. */
export const CAROUSEL_FOLDER = 'bharatmart/carousel'

const CAROUSEL_LOCAL_FILES: Record<string, string[]> = {
  'homemade-pickles': [
    'assets/pickle/carousel/homemade-pickles.png',
    'apps/web/public/carousel/homemade-pickles.png',
  ],
  'homemade-snacks': [
    'assets/pickle/carousel/homemade-snacks.png',
    'apps/web/public/carousel/homemade-snacks.png',
  ],
  rakshabandhan: ['assets/pickle/carousel/Rakshabandhan.png'],
}

function requireCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required to seed carousel images.',
    )
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudName
}

async function resourceExists(publicId: string) {
  try {
    await cloudinary.api.resource(publicId, { resource_type: 'image' })
    return true
  } catch {
    return false
  }
}

export function carouselPublicId(slug: string) {
  return `${CAROUSEL_FOLDER}/${slug}`
}

export function carouselDeliveryUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${publicId}`
}

function localCarouselPath(repoRoot: string, slug: string) {
  const candidates = CAROUSEL_LOCAL_FILES[slug] ?? []
  for (const relativePath of candidates) {
    const absolutePath = path.join(repoRoot, relativePath)
    if (existsSync(absolutePath)) return absolutePath
  }
  return null
}

async function uploadBuffer(buffer: Buffer, publicId: string) {
  requireCloudinary()
  await new Promise<void>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error('Cloudinary upload failed'))
        else resolve()
      },
    )
    stream.end(buffer)
  })
}

/**
 * Upload a carousel slide to Cloudinary if a local file exists (idempotent per slug).
 * Returns the delivery URL, or null when no local asset is found.
 */
export async function resolveSeedCarouselUrl(slug: string, repoRoot = REPO_ROOT) {
  const cloudName = requireCloudinary()
  const publicId = carouselPublicId(slug)

  if (await resourceExists(publicId)) {
    return carouselDeliveryUrl(cloudName, publicId)
  }

  const localPath = localCarouselPath(repoRoot, slug)
  if (!localPath) return null

  const buffer = await readFile(localPath)
  await uploadBuffer(buffer, publicId)
  return carouselDeliveryUrl(cloudName, publicId)
}
