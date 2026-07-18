/**
 * Wipe marketplace + merchant demo/production content.
 * Keeps ADMIN users (e.g. admin@bharatmart.uk) so ops can still sign in.
 *
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/wipe-marketplace.ts
 */
import { PrismaClient, UserRole } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Wiping marketplace and merchant data (keeping ADMIN users)...')

  const deleted = {
    ticketMessages: await prisma.ticketMessage.deleteMany({}),
    supportTickets: await prisma.supportTicket.deleteMany({}),
    notifications: await prisma.notification.deleteMany({}),
    auditLogs: await prisma.auditLog.deleteMany({}),
    orderItems: await prisma.orderItem.deleteMany({}),
    merchantOrders: await prisma.merchantOrder.deleteMany({}),
    orders: await prisma.order.deleteMany({}),
    reviews: await prisma.review.deleteMany({}),
    wishlists: await prisma.wishlist.deleteMany({}),
    followedStores: await prisma.followedStore.deleteMany({}),
    productImages: await prisma.productImage.deleteMany({}),
    products: await prisma.product.deleteMany({}),
    coupons: await prisma.coupon.deleteMany({}),
    merchants: await prisma.merchant.deleteMany({}),
    addresses: await prisma.address.deleteMany({}),
    banners: await prisma.banner.deleteMany({}),
    verificationTokens: await prisma.verificationToken.deleteMany({}),
  }

  // Child categories first (parentId set), then roots.
  const childCategories = await prisma.category.deleteMany({ where: { parentId: { not: null } } })
  const rootCategories = await prisma.category.deleteMany({})

  const nonAdmins = await prisma.user.findMany({
    where: { role: { not: UserRole.ADMIN } },
    select: { id: true, email: true },
  })
  const nonAdminIds = nonAdmins.map((u) => u.id)

  if (nonAdminIds.length > 0) {
    await prisma.account.deleteMany({ where: { userId: { in: nonAdminIds } } })
    await prisma.session.deleteMany({ where: { userId: { in: nonAdminIds } } })
    await prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } })
  }

  // Clear admin sessions/accounts noise but keep the user rows.
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true, email: true },
  })
  const adminIds = admins.map((u) => u.id)
  if (adminIds.length > 0) {
    await prisma.session.deleteMany({ where: { userId: { in: adminIds } } })
  }

  console.log('Deleted counts:', {
    ...Object.fromEntries(Object.entries(deleted).map(([k, v]) => [k, v.count])),
    childCategories: childCategories.count,
    rootCategories: rootCategories.count,
    nonAdminUsers: nonAdmins.length,
  })
  console.log(
    'Kept ADMIN users:',
    admins.map((a) => a.email).join(', ') || '(none)',
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
