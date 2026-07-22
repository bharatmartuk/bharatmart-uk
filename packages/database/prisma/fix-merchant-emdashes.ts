/**
 * Strip em dashes from live merchant descriptions (seed was updated; DB may still have old copy).
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/fix-merchant-emdashes.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '../generated/client'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL

const prisma = new PrismaClient()

async function main() {
  const merchants = await prisma.merchant.findMany({
    select: { id: true, storeName: true, storeDescription: true },
  })

  for (const merchant of merchants) {
    if (!merchant.storeDescription?.includes('—') && !merchant.storeDescription?.includes('–')) {
      continue
    }
    const next = merchant.storeDescription.replaceAll('—', '-').replaceAll('–', '-')
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { storeDescription: next },
    })
    console.log(`Updated description: ${merchant.storeName}`)
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, description: true },
  })
  for (const product of products) {
    if (!product.description.includes('—') && !product.description.includes('–') && !product.name.includes('—')) {
      continue
    }
    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name.replaceAll('—', '-').replaceAll('–', '-'),
        description: product.description.replaceAll('—', '-').replaceAll('–', '-'),
      },
    })
    console.log(`Updated product: ${product.name}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
