import 'server-only'

import { prisma } from '@bharatmart/database'

export const AdminService = {
  async getTotalMerchants() {
    return prisma.merchant.count()
  },

  async getPendingVerificationCount() {
    return prisma.merchant.count({ where: { verificationStatus: 'PENDING' } })
  },

  async getTotalCustomers() {
    return prisma.user.count({ where: { role: 'CUSTOMER' } })
  },

  async getPlatformGMV() {
    const result = await prisma.order.aggregate({
      _sum: { totalInPence: true },
    })
    return result._sum.totalInPence ?? 0
  },

  async getOpenTicketCount() {
    return prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    })
  },

  async getOverviewStats() {
    const [totalMerchants, pendingVerificationCount, totalCustomers, platformGMV, openTicketCount] =
      await Promise.all([
        this.getTotalMerchants(),
        this.getPendingVerificationCount(),
        this.getTotalCustomers(),
        this.getPlatformGMV(),
        this.getOpenTicketCount(),
      ])

    return {
      totalMerchants,
      pendingVerificationCount,
      totalCustomers,
      platformGMV,
      openTicketCount,
    }
  },
}

export const adminService = AdminService
