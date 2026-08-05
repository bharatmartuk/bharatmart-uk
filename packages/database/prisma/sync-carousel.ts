/**
 * Upload carousel slides to Cloudinary (bharatmart/carousel) and upsert Banner rows.
 * Run: pnpm --filter @bharatmart/database db:sync-carousel
 */
import { PrismaClient } from '../generated/client/index.js'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveSeedCarouselUrl } from './lib/seed-carousel.js'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })

const prisma = new PrismaClient()

const START_DATE = new Date('2026-01-01T00:00:00.000Z')
const END_DATE = new Date('2028-01-01T23:59:59.000Z')

const CAROUSEL_SLIDES = [
  {
    id: 'carousel_homemade_pickles',
    slug: 'homemade-pickles',
    fallbackImageUrl: '/carousel/homemade-pickles.png',
    headline: 'Homemade Indian Pickles',
    subtext:
      'Tangy mango, lemon and family-recipe achar - made for everyday meals and festive thalis.',
    ctaText: 'Shop pickles',
    ctaLink: '/products?category=homemade-pickles',
    comingSoon: false,
    sortOrder: 1,
  },
  {
    id: 'carousel_homemade_snacks',
    slug: 'homemade-snacks',
    fallbackImageUrl: '/carousel/homemade-snacks.png',
    headline: 'Crispy Homemade Snacks',
    subtext:
      'Murukulu, janthikalu, sakinalu, gaarelu and more - festive crunch, delivered across the UK.',
    ctaText: 'Shop snacks',
    ctaLink: '/products?category=homemade-snacks',
    comingSoon: false,
    sortOrder: 2,
  },
  {
    id: 'carousel_rakshabandhan',
    slug: 'rakshabandhan',
    fallbackImageUrl: null,
    headline: 'Raksha Bandhan Collection',
    subtext: 'Celebrate the bond with festive rakhis and gifts — launching soon.',
    ctaText: null,
    ctaLink: null,
    comingSoon: true,
    sortOrder: 3,
  },
] as const

async function main() {
  for (const slide of CAROUSEL_SLIDES) {
    const cloudinaryUrl = await resolveSeedCarouselUrl(slide.slug)
    const imageUrl = cloudinaryUrl ?? slide.fallbackImageUrl

    if (!imageUrl) {
      console.warn(`Skipping ${slide.id}: no local file and not yet on Cloudinary`)
      continue
    }

    await prisma.banner.upsert({
      where: { id: slide.id },
      update: {
        imageUrl,
        headline: slide.headline,
        subtext: slide.subtext,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        comingSoon: slide.comingSoon,
        startDate: START_DATE,
        endDate: END_DATE,
        isActive: true,
        sortOrder: slide.sortOrder,
      },
      create: {
        id: slide.id,
        imageUrl,
        headline: slide.headline,
        subtext: slide.subtext,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        comingSoon: slide.comingSoon,
        startDate: START_DATE,
        endDate: END_DATE,
        isActive: true,
        sortOrder: slide.sortOrder,
      },
    })

    console.log(`✓ ${slide.headline} → ${imageUrl}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
