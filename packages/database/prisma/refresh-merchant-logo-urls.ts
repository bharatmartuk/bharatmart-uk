/**
 * Refresh merchant storeLogoUrl delivery transforms in the DB.
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/refresh-merchant-logo-urls.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '../generated/client'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL

const FILL = 'e_trim:40/c_fill,g_center,w_800,h_800,q_auto,f_auto'
const prisma = new PrismaClient()

function rebuild(url: string) {
  const marker = '/image/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const prefix = url.slice(0, idx + marker.length)
  const segments = url.slice(idx + marker.length).split('/').filter(Boolean)
  let i = 0
  while (i < segments.length) {
    const seg = segments[i]
    if (/^v\d+$/.test(seg)) {
      i += 1
      break
    }
    if (seg.includes(',') || /^(c_|e_|w_|h_|q_|f_|g_|b_|ar_|fl_|dpr_|r_)/.test(seg)) {
      i += 1
      continue
    }
    break
  }
  const publicId = segments.slice(i).join('/')
  return publicId ? `${prefix}${FILL}/${publicId}` : url
}

async function main() {
  const merchants = await prisma.merchant.findMany({
    select: { id: true, storeName: true, storeLogoUrl: true },
  })

  for (const merchant of merchants) {
    if (!merchant.storeLogoUrl) continue
    const next = rebuild(merchant.storeLogoUrl)
    if (next === merchant.storeLogoUrl) {
      console.log(`Unchanged: ${merchant.storeName}`)
      continue
    }
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { storeLogoUrl: next },
    })
    console.log(`Updated: ${merchant.storeName}`)
    console.log(`  -> ${next}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
