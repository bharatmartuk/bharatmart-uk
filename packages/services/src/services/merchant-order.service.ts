import 'server-only'

import { prisma } from '@bharatmart/database'
import { NotFoundError, ValidationError } from '../errors'
import { NotificationService } from './notification.service'

type MerchantOrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const transitions: Record<MerchantOrderStatus, MerchantOrderStatus[]> = {
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const MerchantOrderService = {
  async getTodayStats(merchantId: string) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const [orders, revenueAgg, pendingCount] = await Promise.all([
      prisma.merchantOrder.count({
        where: { merchantId, createdAt: { gte: start } },
      }),
      prisma.merchantOrder.aggregate({
        where: {
          merchantId,
          createdAt: { gte: start },
          status: { not: 'CANCELLED' },
        },
        _sum: { subtotalInPence: true },
      }),
      prisma.merchantOrder.count({
        where: { merchantId, status: 'PROCESSING' },
      }),
    ])

    return {
      ordersToday: orders,
      revenueTodayInPence: revenueAgg._sum.subtotalInPence ?? 0,
      pendingOrders: pendingCount,
    }
  },

  async getRevenueChartData(merchantId: string, days = 14) {
    const since = new Date()
    since.setDate(since.getDate() - (days - 1))
    since.setHours(0, 0, 0, 0)

    const orders = await prisma.merchantOrder.findMany({
      where: {
        merchantId,
        createdAt: { gte: since },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, subtotalInPence: true },
    })

    const buckets = new Map<string, number>()
    for (let i = 0; i < days; i += 1) {
      const day = new Date(since)
      day.setDate(since.getDate() + i)
      buckets.set(day.toISOString().slice(0, 10), 0)
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10)
      buckets.set(key, (buckets.get(key) ?? 0) + order.subtotalInPence)
    }

    return [...buckets.entries()].map(([date, revenueInPence]) => ({
      date,
      revenueInPence,
    }))
  },

  getPendingOrders(merchantId: string) {
    return prisma.merchantOrder.findMany({
      where: { merchantId, status: 'PROCESSING' },
      include: {
        order: {
          select: {
            orderNumber: true,
            placedAt: true,
            customer: { select: { name: true, email: true } },
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
          },
        },
        orderItems: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })
  },

  getForMerchant(merchantId: string, statusFilter?: MerchantOrderStatus) {
    return prisma.merchantOrder.findMany({
      where: {
        merchantId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            placedAt: true,
            address: true,
            customer: { select: { name: true, email: true, phone: true } },
            guestFirstName: true,
            guestLastName: true,
            guestEmail: true,
            guestPhone: true,
          },
        },
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  getByIdForMerchant(merchantOrderId: string, merchantId: string) {
    return prisma.merchantOrder.findFirst({
      where: { id: merchantOrderId, merchantId },
      include: {
        order: {
          include: {
            address: true,
            customer: { select: { name: true, email: true, phone: true } },
          },
        },
        orderItems: true,
      },
    })
  },

  async updateStatus(
    merchantOrderId: string,
    merchantId: string,
    newStatus: MerchantOrderStatus,
    trackingInfo?: { trackingNumber?: string; courierName?: string },
  ) {
    const current = await prisma.merchantOrder.findFirst({
      where: { id: merchantOrderId, merchantId },
    })
    if (!current) throw new NotFoundError('Order not found.')

    const allowed = transitions[current.status]
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(`Cannot move from ${current.status} to ${newStatus}.`)
    }

    const updated = await prisma.merchantOrder.update({
      where: { id: merchantOrderId },
      data: {
        status: newStatus,
        ...(trackingInfo?.trackingNumber
          ? { trackingNumber: trackingInfo.trackingNumber }
          : {}),
        ...(trackingInfo?.courierName ? { courierName: trackingInfo.courierName } : {}),
        shippedAt: newStatus === 'SHIPPED' ? new Date() : current.shippedAt,
        deliveredAt: newStatus === 'DELIVERED' ? new Date() : current.deliveredAt,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
            guestEmail: true,
          },
        },
        merchant: { select: { storeName: true } },
      },
    })

    await NotificationService.notifyOrderStatusChanged({
      customerId: updated.order.customerId,
      guestEmail: updated.order.guestEmail,
      orderNumber: updated.order.orderNumber,
      storeName: updated.merchant.storeName,
      status: newStatus,
    })

    return updated
  },
}

export const merchantOrderService = MerchantOrderService
