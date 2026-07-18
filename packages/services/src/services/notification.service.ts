import 'server-only'

import { Resend } from 'resend'
import { prisma } from '@bharatmart/database'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function renderEmail(subject: string, bodyHtml: string) {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#fff8f0;padding:24px;color:#1e1b16">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d6c4ad;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;color:#7f5700;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:12px">BharatMart UK</p>
    <h1 style="color:#7f5700;font-size:20px;margin:0 0 12px">${subject}</h1>
    <div style="margin:0;line-height:1.6;color:#514534">${bodyHtml}</div>
  </div>
  </body></html>`
}

const templates = {
  ORDER_CONFIRMATION: (orderNumber: string) => ({
    title: `Order ${orderNumber} confirmed`,
    body: `Thanks for shopping on BharatMart UK. Your merchants are preparing order <strong>${orderNumber}</strong>.`,
  }),
  MERCHANT_APPROVED: (storeName: string) => ({
    title: 'Store approved',
    body: `<strong>${storeName}</strong> is now live on BharatMart UK. You can start listing products.`,
  }),
  MERCHANT_REJECTED: (storeName: string) => ({
    title: 'Store verification rejected',
    body: `<strong>${storeName}</strong> needs updates before it can go live. Please revise your documents and resubmit.`,
  }),
  ORDER_STATUS_CHANGED: (orderNumber: string, storeName: string, status: string) => ({
    title: `Order ${orderNumber} is now ${status}`,
    body: `<strong>${storeName}</strong> updated your order to <strong>${status}</strong>.`,
  }),
  SUPPORT_REPLY: (ticketSubject: string) => ({
    title: 'New support reply',
    body: `There is a new reply on your support ticket: <strong>${ticketSubject}</strong>.`,
  }),
  NEW_ORDER: (orderId: string) => ({
    title: 'New order received',
    body: `Order <strong>${orderId}</strong> needs fulfilment in your merchant dashboard.`,
  }),
}

/**
 * NotificationService:
 * 1) always writes an in-app Notification row
 * 2) emails via Resend when RESEND_API_KEY is present
 */
export const NotificationService = {
  async notify(
    userId: string,
    type: string,
    data: { title: string; body: string },
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: data.title,
        body: data.body.replace(/<[^>]+>/g, ''),
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    const resend = getResend()
    if (resend && user?.email) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'BharatMart UK <onboarding@resend.dev>',
        to: user.email,
        subject: data.title,
        html: renderEmail(data.title, data.body),
      })
    }

    return notification
  },

  async notifyMerchantVerification(merchantId: string, status: 'APPROVED' | 'REJECTED') {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { userId: true, storeName: true },
    })
    if (!merchant) return null

    const template =
      status === 'APPROVED'
        ? templates.MERCHANT_APPROVED(merchant.storeName)
        : templates.MERCHANT_REJECTED(merchant.storeName)

    return this.notify(merchant.userId, `MERCHANT_${status}`, template)
  },

  async sendOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, customerId: true },
    })
    if (!order) return
    const template = templates.ORDER_CONFIRMATION(order.orderNumber)
    await this.notify(order.customerId, 'ORDER_CONFIRMATION', template)
  },

  async notifyMerchantNewOrder(merchantId: string, orderId: string): Promise<void> {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { userId: true },
    })
    if (!merchant) return
    await this.notify(merchant.userId, 'NEW_ORDER', templates.NEW_ORDER(orderId))
  },

  async notifyOrderStatusChanged(input: {
    customerId: string
    orderNumber: string
    storeName: string
    status: string
  }): Promise<void> {
    await this.notify(
      input.customerId,
      'ORDER_STATUS_CHANGED',
      templates.ORDER_STATUS_CHANGED(input.orderNumber, input.storeName, input.status),
    )
  },

  async notifySupportReply(userId: string, ticketSubject: string): Promise<void> {
    await this.notify(userId, 'SUPPORT_REPLY', templates.SUPPORT_REPLY(ticketSubject))
  },

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const resend = getResend()
    if (!resend) return
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BharatMart UK <onboarding@resend.dev>',
      to,
      subject,
      html: renderEmail(subject, body),
    })
  },
}

export const notificationService = NotificationService
