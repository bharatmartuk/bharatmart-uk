/**
 * One-off migration: upload legacy /products/*.png DB URLs to Cloudinary.
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/migrate-product-images-to-cloudinary.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '../generated/client'
import { resolveSeedProductImageUrl } from './lib/seed-cloudinary'

const prisma = new PrismaClient()
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

async function main() {
  const images = await prisma.productImage.findMany({
    where: {
      OR: [
        { url: { startsWith: '/products/' } },
        { url: { contains: 'picsum.photos' } },
      ],
    },
    include: { product: { select: { slug: true } } },
  })

  console.log(`Migrating ${images.length} product image(s) to Cloudinary…`)

  for (const image of images) {
    const slug = image.product.slug
    const cloudinaryUrl = await resolveSeedProductImageUrl(slug, REPO_ROOT)
    await prisma.productImage.update({
      where: { id: image.id },
      data: { url: cloudinaryUrl },
    })
    console.log(`  ✓ ${slug}`)
  }

  console.log('Done.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
