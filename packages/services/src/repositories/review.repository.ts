import 'server-only'

import { prisma } from '@bharatmart/database'

export const reviewRepository = {
  findForProduct(productId: string, page = 1, pageSize = 10) {
    const take = Math.min(Math.max(pageSize, 1), 50)
    const skip = (Math.max(page, 1) - 1) * take

    return Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          customer: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.review.count({ where: { productId } }),
    ]).then(([items, total]) => ({
      items,
      total,
      page: Math.max(page, 1),
      pageSize: take,
      totalPages: Math.max(Math.ceil(total / take), 1),
    }))
  },
}
