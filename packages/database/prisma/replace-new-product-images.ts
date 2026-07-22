/**
 * Replace the 17 new-category product images with files from assets/pickle/,
 * upload to Cloudinary (overwrite), and update ProductImage URLs in the DB.
 *
 * Run: pnpm --filter @bharatmart/database db:replace-new-product-images
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '../generated/client'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

const SEED_PREFIX = 'bharatmart/products/seed'

/** Local filename in assets/pickle → product slug */
const ASSET_MAP: Array<{ file: string; slug: string }> = [
  { file: 'Handcrafted Brass Diya Set.png', slug: 'handcrafted-brass-diya-set' },
  { file: 'Premium Rangoli Colour Kit.png', slug: 'premium-rangoli-colour-kit' },
  { file: 'Festive Gift Hamper Classic.png', slug: 'festive-gift-hamper-classic' },
  { file: 'Banarasi Silk Saree \u2014 Maroon Gold.png', slug: 'banarasi-silk-saree-maroon-gold' },
  { file: 'Cotton Kurti Everyday Set.png', slug: 'cotton-kurti-everyday-set' },
  { file: "Kids' Festival Sherwani.png", slug: 'kids-festival-sherwani' },
  { file: 'Homestyle Garam Masala.png', slug: 'homestyle-garam-masala-100g' },
  { file: 'Toor Dal Premium.png', slug: 'toor-dal-premium-1kg' },
  { file: 'Ready Biryani Masala Kit.png', slug: 'ready-biryani-masala-kit' },
  { file: 'Aged Basmati Rice.png', slug: 'aged-basmati-rice-5kg' },
  { file: 'Sona Masoori Rice.png', slug: 'sona-masoori-rice-5kg' },
  { file: 'Idli Rice Specialty.png', slug: 'idli-rice-specialty-2kg' },
  { file: 'Alphonso Mango Box.png', slug: 'alphonso-mango-box-seasonal' },
  { file: 'Winter Jaggery Gift Pack.png', slug: 'winter-jaggery-gift-pack' },
  { file: 'Organic Moong Dal.png', slug: 'organic-moong-dal-1kg' },
  { file: 'Cold-Pressed Groundnut Oil.png', slug: 'cold-pressed-groundnut-oil-1l' },
  { file: 'Organic Millet Mix.png', slug: 'organic-millet-mix-1kg' },
]

function requireCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing CLOUDINARY_* env vars in root .env')
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudName
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function uploadBuffer(buffer: Buffer, publicId: string, attempt = 1): Promise<{
  secure_url: string
  public_id: string
}> {
  try {
    return await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          timeout: 180000,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve({ secure_url: result.secure_url, public_id: result.public_id })
        },
      )
      stream.end(buffer)
    })
  } catch (error) {
    if (attempt >= 4) throw error
    console.warn(`    Cloudinary retry ${attempt}/4…`)
    await sleep(3000 * attempt)
    return uploadBuffer(buffer, publicId, attempt + 1)
  }
}

async function updateProductImageUrl(slug: string, url: string) {
  let lastError: unknown
  for (let attempt = 1; attempt <= 6; attempt++) {
    const prisma = new PrismaClient()
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!product) {
        console.warn(`  ⚠ product not found for slug ${slug}`)
        return
      }

      const existing = await prisma.productImage.findFirst({
        where: { productId: product.id },
        orderBy: { sortOrder: 'asc' },
      })

      if (existing) {
        await prisma.productImage.update({
          where: { id: existing.id },
          data: { url },
        })
      } else {
        await prisma.productImage.create({
          data: {
            id: `seed_image_${slug}_1`,
            productId: product.id,
            url,
            sortOrder: 1,
          },
        })
      }
      return
    } catch (error) {
      lastError = error
      console.warn(`    DB retry ${attempt}/6…`)
      await sleep(4000 * attempt)
    } finally {
      await prisma.$disconnect().catch(() => undefined)
    }
  }
  throw lastError
}

async function main() {
  const cloudName = requireCloudinary()
  const assetsDir = path.join(REPO_ROOT, 'assets', 'pickle')
  const uploaded: Array<{ slug: string; url: string }> = []

  console.log(`Phase 1/2 - upload ${ASSET_MAP.length} images to Cloudinary…`)
  for (const { file, slug } of ASSET_MAP) {
    const localPath = path.join(assetsDir, file)
    const buffer = await readFile(localPath)
    const publicId = `${SEED_PREFIX}/${slug}`
    const result = await uploadBuffer(buffer, publicId)
    uploaded.push({ slug, url: result.secure_url })
    console.log(`  ✓ uploaded ${slug}`)
    await sleep(1000)
  }

  console.log(`Phase 2/2 - update ${uploaded.length} ProductImage rows…`)
  for (const { slug, url } of uploaded) {
    await updateProductImageUrl(slug, url)
    console.log(`  ✓ db ${slug}`)
  }

  console.log(`Done. Images on Cloudinary under ${cloudName}/${SEED_PREFIX}/`)
  console.log('Local PNGs remain in assets/pickle (gitignored) - not pushed to GitHub.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
