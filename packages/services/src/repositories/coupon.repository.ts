import 'server-only'

import { prisma } from '@bharatmart/database'

export const couponRepository = {
  findByCode(code: string) {
    return prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  },
}
