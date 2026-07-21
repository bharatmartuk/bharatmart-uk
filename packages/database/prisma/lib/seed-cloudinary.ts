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

const FRIENDLY_ASSET_NAMES: Record<string, string> = {
  'handcrafted-brass-diya-set': 'Handcrafted Brass Diya Set.png',
  'premium-rangoli-colour-kit': 'Premium Rangoli Colour Kit.png',
  'festive-gift-hamper-classic': 'Festive Gift Hamper Classic.png',
  'banarasi-silk-saree-maroon-gold': 'Banarasi Silk Saree \u2014 Maroon Gold.png',
  'cotton-kurti-everyday-set': 'Cotton Kurti Everyday Set.png',
  'kids-festival-sherwani': "Kids' Festival Sherwani.png",
  'homestyle-garam-masala-100g': 'Homestyle Garam Masala.png',
  'toor-dal-premium-1kg': 'Toor Dal Premium.png',
  'ready-biryani-masala-kit': 'Ready Biryani Masala Kit.png',
  'aged-basmati-rice-5kg': 'Aged Basmati Rice.png',
  'sona-masoori-rice-5kg': 'Sona Masoori Rice.png',
  'idli-rice-specialty-2kg': 'Idli Rice Specialty.png',
  'alphonso-mango-box-seasonal': 'Alphonso Mango Box.png',
  'winter-jaggery-gift-pack': 'Winter Jaggery Gift Pack.png',
  'organic-moong-dal-1kg': 'Organic Moong Dal.png',
  'cold-pressed-groundnut-oil-1l': 'Cold-Pressed Groundnut Oil.png',
  'organic-millet-mix-1kg': 'Organic Millet Mix.png',
}

function friendlyAssetCandidates(repoRoot: string, slug: string) {
  const name = FRIENDLY_ASSET_NAMES[slug]
  if (!name) return [] as string[]
  return [path.join(repoRoot, 'assets', 'pickle', name)]
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
    // Human-readable filenames for the 17 new-category products (local only, gitignored).
    ...friendlyAssetCandidates(repoRoot, slug),
  ]

  for (const localPath of localCandidates) {
    if (!existsSync(localPath)) continue
    const buffer = await readFile(localPath)
    return uploadBuffer(buffer, publicId)
  }

  // No local asset — ingest a stable placeholder into our Cloudinary account (not picsum in DB).
  return uploadRemote(`https://picsum.photos/seed/${encodeURIComponent(slug)}/600/600`, publicId)
}
