import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

const LOGO_FOLDER = 'bharatmart/merchant-logos'

const MERCHANT_LOGO_FILES: Record<string, string> = {
  'ammas-andhra-pickle-house': "Amma's Andhra Pickle House.png",
  'narasimhas-village-snacks': "Narasimha's Village Snacks.png",
  'festival-lights-emporium': 'Festival Lights Emporium.png',
  'saree-style-boutique': 'Saree & Style Boutique.png',
  'desi-kitchen-staples': 'Desi Kitchen Staples.png',
  'basmati-house-uk': 'Basmati House UK.png',
  'seasons-bazaar': "Season's Bazaar.png",
  'green-leaf-organics': 'Green Leaf Organics.png',
}

function requireCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required to seed merchant logos.',
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

function logoPublicId(storeSlug: string) {
  return `${LOGO_FOLDER}/${storeSlug}`
}

function logoDeliveryUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/e_trim:40/c_fill,g_center,w_800,h_800,q_auto,f_auto/${publicId}`
}

function localLogoCandidates(repoRoot: string, storeSlug: string) {
  const friendlyName = MERCHANT_LOGO_FILES[storeSlug]
  const candidates = [
    path.join(repoRoot, 'assets', 'merchantprofile', `${storeSlug}.png`),
    path.join(repoRoot, 'assets', 'merchantprofile', `${storeSlug}.jpg`),
    path.join(repoRoot, 'apps', 'web', 'public', 'merchants', `${storeSlug}.png`),
  ]
  if (friendlyName) {
    candidates.unshift(
      path.join(repoRoot, 'assets', 'pickle', 'Merchantprofile', friendlyName),
      path.join(repoRoot, 'assets', 'merchantprofile', friendlyName),
    )
  }
  return candidates
}

async function uploadBuffer(buffer: Buffer, publicId: string) {
  requireCloudinary()
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error('Cloudinary upload failed'))
        else resolve({ secure_url: uploadResult.secure_url })
      },
    )
    stream.end(buffer)
  })
  return result.secure_url
}

/** Resolve a merchant logo URL in Cloudinary for seeding (idempotent per store slug). */
export async function resolveSeedMerchantLogoUrl(storeSlug: string, repoRoot = REPO_ROOT) {
  const cloudName = requireCloudinary()
  const publicId = logoPublicId(storeSlug)

  if (await resourceExists(publicId)) {
    return logoDeliveryUrl(cloudName, publicId)
  }

  for (const localPath of localLogoCandidates(repoRoot, storeSlug)) {
    if (!existsSync(localPath)) continue
    const buffer = await readFile(localPath)
    await uploadBuffer(buffer, publicId)
    return logoDeliveryUrl(cloudName, publicId)
  }

  return null
}
