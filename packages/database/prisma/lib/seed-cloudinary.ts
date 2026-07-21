import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

const PRODUCT_FOLDER = 'bharatmart/products'
const SEED_PUBLIC_ID_PREFIX = `${PRODUCT_FOLDER}/seed`

function requireCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required to seed product images.',
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

function seedPublicId(slug: string) {
  return `${SEED_PUBLIC_ID_PREFIX}/${slug}`
}

function seedDeliveryUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
}

async function uploadBuffer(buffer: Buffer, publicId: string) {
  requireCloudinary()
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, overwrite: true, resource_type: 'image' },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error('Cloudinary upload failed'))
        else resolve({ secure_url: uploadResult.secure_url, public_id: uploadResult.public_id })
      },
    )
    stream.end(buffer)
  })
  return result.secure_url
}

async function uploadRemote(url: string, publicId: string) {
  requireCloudinary()
  const result = await cloudinary.uploader.upload(url, {
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  })
  return result.secure_url
}

/** Resolve a product image URL in Cloudinary for seeding (idempotent per slug). */
export async function resolveSeedProductImageUrl(slug: string, repoRoot: string) {
  const cloudName = requireCloudinary()
  const publicId = seedPublicId(slug)

  if (await resourceExists(publicId)) {
    return seedDeliveryUrl(cloudName, publicId)
  }

  const localCandidates = [
    path.join(repoRoot, 'assets', 'products', `${slug}.png`),
    path.join(repoRoot, 'apps', 'web', 'public', 'products', `${slug}.png`),
  ]

  for (const localPath of localCandidates) {
    if (!existsSync(localPath)) continue
    const buffer = await readFile(localPath)
    return uploadBuffer(buffer, publicId)
  }

  // No local asset — ingest a stable placeholder into our Cloudinary account (not picsum in DB).
  return uploadRemote(`https://picsum.photos/seed/${encodeURIComponent(slug)}/600/600`, publicId)
}
