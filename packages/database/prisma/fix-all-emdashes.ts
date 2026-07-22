/**
 * Strip em/en dashes from all user-visible text fields in the live DB.
 * Covers banners, products, merchants, categories, reviews, tickets, notifications, etc.
 *
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/fix-all-emdashes.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '../generated/client'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
loadEnv({ path: path.join(REPO_ROOT, '.env') })
loadEnv({ path: path.join(REPO_ROOT, '.env.local'), override: true })
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL

const prisma = new PrismaClient()

const EM = '—'
const EN = '–'

function hasDash(value: string | null | undefined): value is string {
  return Boolean(value && (value.includes(EM) || value.includes(EN)))
}

function clean(value: string): string {
  return value.replaceAll(EM, '-').replaceAll(EN, '-')
}

function cleanOptional(value: string | null | undefined): string | null | undefined {
  if (value == null) return value
  return hasDash(value) ? clean(value) : value
}

async function main() {
  let updated = 0

  // Banners (hero carousel - the live issue)
  for (const row of await prisma.banner.findMany()) {
    const data: Record<string, string> = {}
    if (hasDash(row.headline)) data.headline = clean(row.headline)
    if (hasDash(row.subtext)) data.subtext = clean(row.subtext!)
    if (hasDash(row.ctaText)) data.ctaText = clean(row.ctaText!)
    if (Object.keys(data).length === 0) continue
    await prisma.banner.update({ where: { id: row.id }, data })
    console.log(`Banner: ${row.headline}`)
    updated += 1
  }

  // Products
  for (const row of await prisma.product.findMany({
    select: { id: true, name: true, description: true, sku: true },
  })) {
    const data: Record<string, string> = {}
    if (hasDash(row.name)) data.name = clean(row.name)
    if (hasDash(row.description)) data.description = clean(row.description)
    if (hasDash(row.sku)) data.sku = clean(row.sku)
    if (Object.keys(data).length === 0) continue
    await prisma.product.update({ where: { id: row.id }, data })
    console.log(`Product: ${row.name}`)
    updated += 1
  }

  // Merchants
  for (const row of await prisma.merchant.findMany({
    select: {
      id: true,
      businessName: true,
      storeName: true,
      storeDescription: true,
      registrationNumber: true,
    },
  })) {
    const data: Record<string, string> = {}
    if (hasDash(row.businessName)) data.businessName = clean(row.businessName)
    if (hasDash(row.storeName)) data.storeName = clean(row.storeName)
    if (hasDash(row.storeDescription)) data.storeDescription = clean(row.storeDescription!)
    if (hasDash(row.registrationNumber)) data.registrationNumber = clean(row.registrationNumber!)
    if (Object.keys(data).length === 0) continue
    await prisma.merchant.update({ where: { id: row.id }, data })
    console.log(`Merchant: ${row.storeName}`)
    updated += 1
  }

  // Categories
  for (const row of await prisma.category.findMany({ select: { id: true, name: true } })) {
    if (!hasDash(row.name)) continue
    await prisma.category.update({ where: { id: row.id }, data: { name: clean(row.name) } })
    console.log(`Category: ${row.name}`)
    updated += 1
  }

  // Reviews
  for (const row of await prisma.review.findMany({ select: { id: true, comment: true } })) {
    if (!hasDash(row.comment)) continue
    await prisma.review.update({ where: { id: row.id }, data: { comment: clean(row.comment!) } })
    console.log(`Review: ${row.id}`)
    updated += 1
  }

  // Order item name snapshots (visible on order history)
  for (const row of await prisma.orderItem.findMany({
    select: { id: true, productNameSnapshot: true },
  })) {
    if (!hasDash(row.productNameSnapshot)) continue
    await prisma.orderItem.update({
      where: { id: row.id },
      data: { productNameSnapshot: clean(row.productNameSnapshot) },
    })
    console.log(`OrderItem: ${row.productNameSnapshot}`)
    updated += 1
  }

  // Coupons
  for (const row of await prisma.coupon.findMany({ select: { id: true, code: true } })) {
    if (!hasDash(row.code)) continue
    await prisma.coupon.update({ where: { id: row.id }, data: { code: clean(row.code) } })
    console.log(`Coupon: ${row.code}`)
    updated += 1
  }

  // Support tickets + messages
  for (const row of await prisma.supportTicket.findMany({ select: { id: true, subject: true } })) {
    if (!hasDash(row.subject)) continue
    await prisma.supportTicket.update({
      where: { id: row.id },
      data: { subject: clean(row.subject) },
    })
    console.log(`Ticket: ${row.subject}`)
    updated += 1
  }
  for (const row of await prisma.ticketMessage.findMany({ select: { id: true, message: true } })) {
    if (!hasDash(row.message)) continue
    await prisma.ticketMessage.update({
      where: { id: row.id },
      data: { message: clean(row.message) },
    })
    console.log(`TicketMessage: ${row.id}`)
    updated += 1
  }

  // Notifications
  for (const row of await prisma.notification.findMany({
    select: { id: true, title: true, body: true },
  })) {
    const data: Record<string, string> = {}
    if (hasDash(row.title)) data.title = clean(row.title)
    if (hasDash(row.body)) data.body = clean(row.body)
    if (Object.keys(data).length === 0) continue
    await prisma.notification.update({ where: { id: row.id }, data })
    console.log(`Notification: ${row.title}`)
    updated += 1
  }

  // Users (display names)
  for (const row of await prisma.user.findMany({ select: { id: true, name: true } })) {
    if (!hasDash(row.name)) continue
    await prisma.user.update({ where: { id: row.id }, data: { name: clean(row.name!) } })
    console.log(`User: ${row.name}`)
    updated += 1
  }

  // Address labels
  for (const row of await prisma.address.findMany({ select: { id: true, label: true, line1: true, line2: true } })) {
    const data: Record<string, string> = {}
    if (hasDash(row.label)) data.label = clean(row.label)
    if (hasDash(row.line1)) data.line1 = clean(row.line1)
    if (hasDash(row.line2)) data.line2 = clean(row.line2!)
    if (Object.keys(data).length === 0) continue
    await prisma.address.update({ where: { id: row.id }, data })
    console.log(`Address: ${row.id}`)
    updated += 1
  }

  // Merchant order tracking labels
  for (const row of await prisma.merchantOrder.findMany({
    select: { id: true, trackingNumber: true, courierName: true },
  })) {
    const data: Record<string, string> = {}
    if (hasDash(row.trackingNumber)) data.trackingNumber = clean(row.trackingNumber!)
    if (hasDash(row.courierName)) data.courierName = clean(row.courierName!)
    if (Object.keys(data).length === 0) continue
    await prisma.merchantOrder.update({ where: { id: row.id }, data })
    console.log(`MerchantOrder: ${row.id}`)
    updated += 1
  }

  void cleanOptional
  console.log(`Done. Updated ${updated} row(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
