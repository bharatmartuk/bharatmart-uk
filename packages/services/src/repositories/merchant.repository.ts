import 'server-only'

import { prisma } from '@bharatmart/database'

export const merchantRepository = {
  findById(id: string) {
    return prisma.merchant.findUnique({ where: { id } })
  },

  findBySlug(storeSlug: string) {
    return prisma.merchant.findUnique({ where: { storeSlug } })
  },

  findFeatured(limit: number, deliveryArea?: string) {
    return prisma.merchant.findMany({
      where: {
        verificationStatus: 'APPROVED',
        products: { some: { status: 'ACTIVE' } },
        ...(deliveryArea ? { deliveryPostcodes: { has: deliveryArea } } : {}),
      },
      include: { _count: { select: { products: true } } },
      orderBy: [{ avgRating: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    })
  },

  findByVerificationStatus(verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return prisma.merchant.findMany({
      where: { verificationStatus },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
  },

  findApprovedForFilters(limit = 20, deliveryArea?: string) {
    return prisma.merchant.findMany({
      where: {
        verificationStatus: 'APPROVED',
        ...(deliveryArea ? { deliveryPostcodes: { has: deliveryArea } } : {}),
      },
      select: { id: true, storeName: true, storeSlug: true },
      orderBy: { storeName: 'asc' },
      take: limit,
    })
  },
}
