import 'server-only'

import { prisma } from '@bharatmart/database'

/**
 * Platform-wide order monitoring. Intentionally separate from MerchantOrderService
 * so merchant-scoped queries never accidentally cross merchant boundaries.
 */
export const AdminOrderService = {
  searchAllOrders(filters?: {
    q?: string | undefined
    status?: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | undefined
    page?: number | undefined
    pageSize?: number | undefined
  }) {
    const page = Math.max(filters?.page ?? 1, 1)
    const pageSize = Math.min(Math.max(filters?.pageSize ?? 25, 1), 100)

    const where = {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.q
        ? {
            OR: [
              { order: { orderNumber: { contains: filters.q, mode: 'insensitive' as const } } },
              { merchant: { storeName: { contains: filters.q, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    }

    return Promise.all([
      prisma.merchantOrder.findMany({
        where,
        include: {
          merchant: { select: { id: true, storeName: true, storeSlug: true } },
          order: {
            select: {
              orderNumber: true,
              placedAt: true,
              customer: { select: { name: true, email: true } },
            },
          },
          orderItems: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.merchantOrder.count({ where }),
    ]).then(([items, total]) => ({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    }))
  },
}

export const adminOrderService = AdminOrderService
