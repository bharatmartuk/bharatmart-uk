/**
 * Report any remaining em/en dashes in user-visible DB text.
 * Run: pnpm --filter @bharatmart/database exec tsx prisma/audit-emdashes.ts
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
const DASH = /[—–]/

function hit(label: string, id: string, field: string, value: string | null | undefined) {
  if (value && DASH.test(value)) console.log(`${label} ${id}.${field}: ${value}`)
}

async function main() {
  for (const b of await prisma.banner.findMany()) {
    hit('Banner', b.id, 'headline', b.headline)
    hit('Banner', b.id, 'subtext', b.subtext)
    hit('Banner', b.id, 'ctaText', b.ctaText)
  }
  for (const p of await prisma.product.findMany({ select: { id: true, name: true, description: true } })) {
    hit('Product', p.id, 'name', p.name)
    hit('Product', p.id, 'description', p.description)
  }
  for (const m of await prisma.merchant.findMany({
    select: { id: true, storeName: true, storeDescription: true, businessName: true },
  })) {
    hit('Merchant', m.id, 'storeName', m.storeName)
    hit('Merchant', m.id, 'businessName', m.businessName)
    hit('Merchant', m.id, 'storeDescription', m.storeDescription)
  }
  for (const c of await prisma.category.findMany({ select: { id: true, name: true } })) {
    hit('Category', c.id, 'name', c.name)
  }
  for (const r of await prisma.review.findMany({ select: { id: true, comment: true } })) {
    hit('Review', r.id, 'comment', r.comment)
  }
  for (const o of await prisma.orderItem.findMany({ select: { id: true, productNameSnapshot: true } })) {
    hit('OrderItem', o.id, 'productNameSnapshot', o.productNameSnapshot)
  }
  for (const t of await prisma.supportTicket.findMany({ select: { id: true, subject: true } })) {
    hit('Ticket', t.id, 'subject', t.subject)
  }
  for (const tm of await prisma.ticketMessage.findMany({ select: { id: true, message: true } })) {
    hit('TicketMessage', tm.id, 'message', tm.message)
  }
  for (const n of await prisma.notification.findMany({ select: { id: true, title: true, body: true } })) {
    hit('Notification', n.id, 'title', n.title)
    hit('Notification', n.id, 'body', n.body)
  }
  console.log('Audit complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
