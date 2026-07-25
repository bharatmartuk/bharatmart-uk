import { PrismaClient } from '../generated/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaClientVersion: string | undefined
}

/** Bump when schema identity fields change so Next.js HMR does not keep a stale client. */
const PRISMA_CLIENT_VERSION = 'order-status-placed-v4'

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION
}

export default prisma
export { Prisma } from '../generated/client'
export type { PrismaClient } from '../generated/client'
