import 'server-only'

import { Prisma, prisma } from '@bharatmart/database'

export type PlaceOrderItemInput = {
  productId: string
  quantity: number
}

export type PaymentMethodInput = 'CARD' | 'CASH_ON_DELIVERY'

export type GuestContactInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type PlaceOrderInput = {
  customerId: string
  addressId: string
  paymentMethod?: PaymentMethodInput
  paymentIntentId?: string | null
  deliveryFeeInPence?: number
  discountInPence?: number
  items: PlaceOrderItemInput[]
}

export type PlaceGuestOrderInput = {
  addressId: string
  paymentMethod?: PaymentMethodInput
  paymentIntentId?: string | null
  deliveryFeeInPence?: number
  discountInPence?: number
  items: PlaceOrderItemInput[]
  guest: GuestContactInput
}

export const orderRepository = {
  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        address: true,
        merchantOrders: {
          include: {
            merchant: { select: { id: true, storeName: true, storeSlug: true } },
            orderItems: true,
          },
        },
      },
    })
  },

  findByPaymentIntentId(paymentIntentId: string) {
    return prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        merchantOrders: true,
      },
    })
  },

  findForCustomer(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        address: true,
        merchantOrders: {
          include: {
            merchant: { select: { id: true, storeName: true, storeSlug: true } },
            orderItems: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { placedAt: 'desc' },
    })
  },

  async createPendingOrder(input: PlaceOrderInput | PlaceGuestOrderInput) {
    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) }, status: 'ACTIVE' },
    })

    if (products.length !== input.items.length) {
      throw new Error('One or more products are unavailable.')
    }

    const productMap = new Map(products.map((product) => [product.id, product]))
    let subtotalInPence = 0

    for (const item of input.items) {
      const product = productMap.get(item.productId)
      if (!product) throw new Error('Product not found.')
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`)
      }
      subtotalInPence += product.priceInPence * item.quantity
    }

    const deliveryFeeInPence = input.deliveryFeeInPence ?? 0
    const discountInPence = input.discountInPence ?? 0
    const totalInPence = Math.max(subtotalInPence + deliveryFeeInPence - discountInPence, 0)
    const year = new Date().getFullYear()
    const sequence = Math.floor(Math.random() * 900000) + 100000
    const orderNumber = `BM-${year}-${sequence}`
    const paymentMethod = input.paymentMethod ?? 'CARD'
    const guest = 'guest' in input ? input.guest : null
    const customerId = 'customerId' in input ? input.customerId : null

    return prisma.order.create({
      data: {
        orderNumber,
        customerId,
        addressId: input.addressId,
        totalInPence,
        deliveryFeeInPence,
        discountInPence,
        paymentStatus: 'PENDING',
        paymentMethod,
        checkoutSnapshot: input.items,
        ...(guest
          ? {
              guestFirstName: guest.firstName,
              guestLastName: guest.lastName,
              guestEmail: guest.email.toLowerCase(),
              guestPhone: guest.phone,
            }
          : {}),
        ...(input.paymentIntentId
          ? { stripePaymentIntentId: input.paymentIntentId }
          : {}),
      },
    })
  },

  findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        address: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        merchantOrders: {
          include: {
            merchant: { select: { id: true, storeName: true, storeSlug: true } },
            orderItems: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  findGuestOrderForTrack(orderNumber: string, email: string) {
    return prisma.order.findFirst({
      where: {
        orderNumber,
        OR: [
          { guestEmail: { equals: email, mode: 'insensitive' } },
          { customer: { email: { equals: email, mode: 'insensitive' } } },
        ],
      },
      include: {
        address: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        merchantOrders: {
          include: {
            merchant: { select: { id: true, storeName: true, storeSlug: true } },
            orderItems: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  attachGuestOrdersToUser(userId: string, email: string) {
    return prisma.order.updateMany({
      where: {
        customerId: null,
        guestEmail: { equals: email, mode: 'insensitive' },
      },
      data: { customerId: userId },
    })
  },

  async attachPaymentIntent(orderId: string, paymentIntentId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntentId },
    })
  },

  async finalizeOrder(
    orderId: string,
    options: { paymentStatus: 'CAPTURED' | 'PENDING' } = { paymentStatus: 'CAPTURED' },
  ) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: { merchantOrders: true },
    })

    if (!existing) {
      throw new Error('Order not found.')
    }

    if (existing.merchantOrders.length > 0 && existing.checkoutSnapshot == null) {
      return existing
    }

    const cartItems = (existing.checkoutSnapshot as PlaceOrderItemInput[] | null) ?? []
    if (!cartItems.length) {
      throw new Error('Checkout snapshot missing for order finalization.')
    }

    const products = await prisma.product.findMany({
      where: { id: { in: cartItems.map((item) => item.productId) } },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const groups = new Map<
      string,
      Array<{
        productId: string
        productNameSnapshot: string
        priceInPenceSnapshot: number
        quantity: number
      }>
    >()

    for (const item of cartItems) {
      const product = productMap.get(item.productId)
      if (!product) throw new Error('Product missing during order finalization.')
      const existingGroup = groups.get(product.merchantId) ?? []
      existingGroup.push({
        productId: product.id,
        productNameSnapshot: product.name,
        priceInPenceSnapshot: product.priceInPence,
        quantity: item.quantity,
      })
      groups.set(product.merchantId, existingGroup)
    }

    return prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        })
        if (updated.count !== 1) {
          throw new Error('Insufficient stock while finalizing order.')
        }
      }

      if (existing.merchantOrders.length === 0) {
        for (const [merchantId, orderItems] of groups.entries()) {
          await tx.merchantOrder.create({
            data: {
              orderId: existing.id,
              merchantId,
              status: 'PROCESSING',
              subtotalInPence: orderItems.reduce(
                (sum, line) => sum + line.priceInPenceSnapshot * line.quantity,
                0,
              ),
              orderItems: { create: orderItems },
            },
          })
        }
      }

      return tx.order.update({
        where: { id: existing.id },
        data: {
          paymentStatus: options.paymentStatus,
          checkoutSnapshot: Prisma.DbNull,
        },
        include: {
          merchantOrders: { include: { orderItems: true } },
        },
      })
    })
  },

  async finalizePaidOrder(paymentIntentId: string) {
    const existing = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      select: { id: true },
    })
    if (!existing) {
      throw new Error('Order not found for payment intent.')
    }
    return this.finalizeOrder(existing.id, { paymentStatus: 'CAPTURED' })
  },
}
