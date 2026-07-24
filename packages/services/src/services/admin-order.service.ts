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
              { order: { customer: { name: { contains: filters.q, mode: 'insensitive' as const } } } },
              { order: { customer: { email: { contains: filters.q, mode: 'insensitive' as const } } } },
              { order: { guestEmail: { contains: filters.q, mode: 'insensitive' as const } } },
              {
                order: {
                  guestFirstName: { contains: filters.q, mode: 'insensitive' as const },
                },
              },
              {
                order: {
                  guestLastName: { contains: filters.q, mode: 'insensitive' as const },
                },
              },
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
              id: true,
              orderNumber: true,
              placedAt: true,
              totalInPence: true,
              paymentStatus: true,
              paymentMethod: true,
              customer: { select: { id: true, name: true, email: true, phone: true } },
              guestFirstName: true,
              guestLastName: true,
              guestEmail: true,
              guestPhone: true,
              address: {
                select: {
                  label: true,
                  line1: true,
                  line2: true,
                  city: true,
                  postcode: true,
                  country: true,
                },
              },
            },
          },
          orderItems: {
            select: {
              id: true,
              productNameSnapshot: true,
              priceInPenceSnapshot: true,
              quantity: true,
            },
          },
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

  getById(merchantOrderId: string) {
    return prisma.merchantOrder.findUnique({
      where: { id: merchantOrderId },
      include: {
        merchant: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            businessName: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            placedAt: true,
            totalInPence: true,
            deliveryFeeInPence: true,
            discountInPence: true,
            paymentStatus: true,
            paymentMethod: true,
            stripePaymentIntentId: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
              },
            },
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            guestPhone: true,
            address: {
              select: {
                id: true,
                label: true,
                line1: true,
                line2: true,
                city: true,
                county: true,
                postcode: true,
                country: true,
              },
            },
          },
        },
        orderItems: {
          select: {
            id: true,
            productId: true,
            productNameSnapshot: true,
            priceInPenceSnapshot: true,
            quantity: true,
            product: {
              select: {
                slug: true,
                sku: true,
              },
            },
          },
        },
      },
    })
  },
}

export const adminOrderService = AdminOrderService
