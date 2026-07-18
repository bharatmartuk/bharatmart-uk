import 'server-only'

import { prisma } from '@bharatmart/database'

export const bannerRepository = {
  findActive(now = new Date()) {
    return prisma.banner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { sortOrder: 'asc' },
    })
  },
}
