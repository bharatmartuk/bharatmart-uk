import { config } from 'dotenv'
import { resolve } from 'node:path'
import { PrismaClient } from '../generated/client/index.js'

config({ path: resolve(process.cwd(), '../../.env') })

const prisma = new PrismaClient()

async function main() {
  await prisma.category.updateMany({
    where: { slug: 'homemade-foods' },
    data: { iconUrl: null },
  })

  await prisma.category.update({
    where: { slug: 'organic-store' },
    data: { sortOrder: 7, comingSoon: false },
  })

  await prisma.category.update({
    where: { slug: 'ayurveda' },
    data: { sortOrder: 8, comingSoon: true },
  })

  console.log('Category marketplace defaults synced.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
