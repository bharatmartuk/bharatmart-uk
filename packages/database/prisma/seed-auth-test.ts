/**
 * Manual auth test users (temporary — replaced by full seed in next phase).
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/seed-auth-test.ts
 */
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

const PASSWORD = 'Password123!'

async function upsertUser(input: {
  email: string
  name: string
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN'
}) {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      passwordHash,
    },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
    },
  })
}

async function main() {
  const customer = await upsertUser({
    email: 'customer@bharatmart.test',
    name: 'Test Customer',
    role: 'CUSTOMER',
  })

  const merchantUser = await upsertUser({
    email: 'merchant@bharatmart.test',
    name: 'Test Merchant',
    role: 'MERCHANT',
  })

  const admin = await upsertUser({
    email: 'admin@bharatmart.test',
    name: 'Test Admin',
    role: 'ADMIN',
  })

  await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {
      businessName: 'Test Grocery Ltd',
      storeName: 'Test Grocery',
      storeSlug: 'test-grocery',
      verificationStatus: 'APPROVED',
      businessType: 'GROCERY',
    },
    create: {
      userId: merchantUser.id,
      businessName: 'Test Grocery Ltd',
      businessType: 'GROCERY',
      verificationStatus: 'APPROVED',
      verificationDocumentUrls: [],
      storeName: 'Test Grocery',
      storeSlug: 'test-grocery',
      deliveryPostcodes: ['E1', 'E2'],
    },
  })

  console.log('Seeded auth test users (password for all: Password123!):')
  console.log(`- CUSTOMER  ${customer.email}`)
  console.log(`- MERCHANT  ${merchantUser.email}`)
  console.log(`- ADMIN     ${admin.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
