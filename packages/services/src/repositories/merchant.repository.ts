import 'server-only'

import { prisma } from '@bharatmart/database'

export const merchantRepository = {
  findById(id: string) {
    return prisma.merchant.findUnique({ where: { id } })
  },

  findBySlug(storeSlug: string) {
    return prisma.merchant.findUnique({ where: { storeSlug } })
  },

  findFeatured(limit: number) {
    return prisma.merchant.findMany({
      where: { verificationStatus: 'APPROVED' },
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

  findApprovedForFilters(limit = 20) {
    return prisma.merchant.findMany({
      where: { verificationStatus: 'APPROVED' },
      select: { id: true, storeName: true, storeSlug: true },
      orderBy: { storeName: 'asc' },
      take: limit,
    })
  },
}
