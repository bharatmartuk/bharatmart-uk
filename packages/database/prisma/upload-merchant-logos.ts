/**
 * Upload merchant logos from assets/pickle/Merchantprofile (or assets/merchantprofile)
 * to Cloudinary and update Merchant.storeLogoUrl in the DB.
 *
 * Run: pnpm --filter @bharatmart/database db:upload-merchant-logos
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '../generated/client'
import { resolveSeedMerchantLogoUrl } from './lib/seed-merchant-logos'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

const prisma = new PrismaClient()

async function main() {
  const merchants = await prisma.merchant.findMany({
    select: { id: true, storeSlug: true, storeName: true, storeLogoUrl: true },
    orderBy: { storeName: 'asc' },
  })

  for (const merchant of merchants) {
    const logoUrl = await resolveSeedMerchantLogoUrl(merchant.storeSlug, REPO_ROOT)
    if (!logoUrl) {
      console.warn(`No local logo found for ${merchant.storeName} (${merchant.storeSlug})`)
      continue
    }

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { storeLogoUrl: logoUrl },
    })
    console.log(`Updated ${merchant.storeName}: ${logoUrl}`)
  }

  console.log('Merchant logos synced to Cloudinary.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
